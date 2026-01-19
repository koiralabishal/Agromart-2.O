import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";

// @desc    Get Wallet Data (Balance & Transactions) for a user
// @route   GET /api/wallet/:userId
// @access  Private
export const getWalletData = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Buyers are consumers and don't need balance/wallets, but can see history
    const sellerRoles = ["farmer", "collector", "supplier"];
    const isSeller = sellerRoles.includes(user.role);

    // Fetch Wallet (only for sellers)
    let wallet = null;
    if (isSeller) {
      wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = await Wallet.create({ userId });
      }
    }

    // Fetch Transactions (Split into Online and COD)
    const transactions = await Transaction.find({ 
      $or: [
        { sellerId: userId },
        { buyerId: userId }
      ]
    })
      .populate("sellerId", "name role")
      .populate("buyerId", "name role")
      .sort({ createdAt: -1 })
      .limit(50);

    // Online transactions: 
    // - For sellers: Credits (Earnings)
    // - For buyers: Payments they made
    const onlineTransactions = transactions.filter(t => {
      const isOnline = t.paymentMethod !== 'COD';
      if (!isOnline) return false;

      const asSeller = t.sellerId?._id?.toString() === userId.toString() || t.sellerId?.toString() === userId.toString();
      const asBuyer = t.buyerId?._id?.toString() === userId.toString() || t.buyerId?.toString() === userId.toString();

      if (asSeller) return t.type === 'Credit'; // Earnings
      if (asBuyer) return true; // Any purchase made online

      return false;
    });
    
    // COD transactions (Can be Received or Paid)
    const codTransactions = transactions.filter(t => t.paymentMethod === 'COD');
    
    console.log(`[Wallet] Online: ${onlineTransactions.length}, COD: ${codTransactions.length}`);

    // Fetch Recent Withdrawal Requests
    const withdrawals = await Withdrawal.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      wallet,
      onlineTransactions,
      codTransactions,
      withdrawals
    });
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request a Withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
export const requestWithdrawal = async (req, res) => {
  try {
    const { userId, amount, paymentMethod, accountDetails } = req.body;

    // 0. Check user role - only sellers can withdraw
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Normalize paymentMethod for consistency
    let normalizedMethod = paymentMethod;
    const lowerMethod = paymentMethod.toLowerCase();
    if (lowerMethod === "esewa") normalizedMethod = "eSewa";
    if (lowerMethod === "khalti") normalizedMethod = "Khalti";
    if (lowerMethod.includes("bank")) normalizedMethod = "Bank Transfer";

    // Buyers are pure consumers and cannot withdraw
    const sellerRoles = ["farmer", "collector", "supplier"];
    if (!sellerRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: "Withdrawal is only available for sellers (farmers, collectors, suppliers)",
        role: user.role 
      });
    }

    // 1. Validate Balance and Wallet Status
    const wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.isFrozen === "yes") {
      return res.status(403).json({ 
        message: "This wallet is currently frozen by the administrator. Please contact support." 
      });
    }

    if (wallet.availableBalance < amount) {
      return res.status(400).json({ message: "Insufficient available balance" });
    }

    // 2. Create Withdrawal Request
    const withdrawal = new Withdrawal({
      userId,
      amount,
      paymentMethod: normalizedMethod,
      accountDetails,
      status: 'Pending'
    });

    await withdrawal.save();

    // 3. DO NOT Deduct from available balance immediately anymore
    // Balance will be deducted only when the status is 'Verified' by the Admin.
    // wallet.availableBalance -= amount;
    // await wallet.save();

    // 4. Create a Transaction Record (Debit)
    await Transaction.create({
      sellerId: userId,
      amount,
      type: 'Debit',
      status: 'Pending',
      paymentMethod: normalizedMethod,
      description: `Withdrawal Request (${normalizedMethod})`,
    });

    res.status(201).json({
      message: "Withdrawal request submitted successfully",
      withdrawal
    });
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get User's Payment Details
// @route   GET /api/wallet/payment-details/:userId
// @access  Private
export const getPaymentDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user to determine role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch payment details based on role
    let paymentDetails = null;
    
    if (user.role === "farmer") {
      const farmer = await Farmer.findOne({ userId });
      paymentDetails = farmer?.paymentDetails;
    } else if (user.role === "collector") {
      const collector = await Collector.findOne({ userId });
      paymentDetails = collector?.paymentDetails;
    } else if (user.role === "supplier") {
      const supplier = await Supplier.findOne({ userId });
      paymentDetails = supplier?.paymentDetails;
    }

    if (!paymentDetails) {
      return res.status(404).json({ 
        message: "Payment details not found. Please update your profile." 
      });
    }

    res.json({
      paymentMethod: paymentDetails.method,
      gatewayId: paymentDetails.gatewayId
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: error.message });
  }
};
