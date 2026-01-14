import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
import Collector from "../models/Collector.js";
import Supplier from "../models/Supplier.js";

// @desc    Get Wallet Data (Balance & Transactions) for a user
// @route   GET /api/wallet/:userId
// @access  Private
export const getWalletData = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check user role - only sellers (farmer, collector, supplier) should have wallets
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Buyers are pure consumers and don't need wallets
    const sellerRoles = ["farmer", "collector", "supplier"];
    if (!sellerRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: "Wallet access is only available for sellers (farmers, collectors, suppliers)",
        role: user.role 
      });
    }

    // Fetch Wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      // Only create wallet for sellers
      wallet = await Wallet.create({ userId });
    }

    // Fetch Transactions (Split into Online and COD)
    // Query by sellerId since this user is the seller receiving payments
    const transactions = await Transaction.find({ sellerId: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`[Wallet] User ${userId} - Found ${transactions.length} transactions`);
    
    const onlineTransactions = transactions.filter(t => t.paymentMethod !== 'COD' && t.type === 'Credit');
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

    // 1. Validate Balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.availableBalance < amount) {
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

    // 3. Deduct from available balance and move to locked/pending? 
    // Actually, usually we deduct immediately to prevent double spending
    wallet.availableBalance -= amount;
    await wallet.save();

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
