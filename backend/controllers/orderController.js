import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
import Collector from "../models/Collector.js";
import Supplier from "../models/Supplier.js";
import Buyer from "../models/Buyer.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { emitToUser, emitToRole, broadcast } from "../socket.js";
import { logActivity } from "../utils/activityLogger.js";
import { sendOrderEmail } from "../utils/emailService.js";

// eSewa Configuration (Test Environment)
const ESEWA_TEST_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_PRODUCT_CODE = "EPAYTEST";
const ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q";

// ==========================================
// Helper Functions
// ==========================================

// Generate eSewa Signature
const generateSignature = (totalAmount, transactionUuid, productCode) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
  hmac.update(message);
  return hmac.digest("base64");
};

// Group Cart Items by Seller
const groupCartItemsBySeller = (cartItems) => {
  const sellerGroups = {};
  cartItems.forEach((item) => {
    let sellerId = item.userID?._id || item.userID?.id || item.userID;

    // Ensure sellerId is a string for grouping keys
    if (sellerId && typeof sellerId === "object") {
      sellerId = sellerId.toString();
    } else if (sellerId) {
      sellerId = String(sellerId);
    }

    if (!sellerId) sellerId = "unknown_seller";

    if (!sellerGroups[sellerId]) {
      sellerGroups[sellerId] = {
        sellerId,
        products: [],
        amount: 0,
      };
    }

    const itemTotal = item.price * item.quantity;
    sellerGroups[sellerId].products.push({
      productID: item._id || item.id,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      unit: item.unit,
      image: item.productImage,
      category: item.category,
      productDescription: item.productDescription,
    });
    sellerGroups[sellerId].amount += itemTotal;
  });
  console.log(
    ">>> [orderController] Grouped cart items by seller:",
    Object.keys(sellerGroups),
  );
  return sellerGroups;
};

// ==========================================
// Payment Initiation (eSewa)
// ==========================================

// @desc    Initiate Payment (Generate Signature Only)
// @route   POST /api/orders/initiate
// @access  Private
export const initiatePayment = async (req, res) => {
  console.log("Initiate Payment Request:", req.body);
  try {
    const { totalAmount } = req.body;

    // Generate Transaction UUID
    const transactionUuid = `${Date.now()}-${uuidv4()}`;

    // eSewa Configuration
    const amountStr = Number(totalAmount).toFixed(2);
    const taxAmountStr = "0";
    const serviceChargeStr = "0";
    const deliveryChargeStr = "0";

    const signature = generateSignature(
      amountStr,
      transactionUuid,
      ESEWA_PRODUCT_CODE,
    );

    res.json({
      message: "Payment initiated",
      paymentParams: {
        amount: amountStr,
        tax_amount: taxAmountStr,
        total_amount: amountStr,
        transaction_uuid: transactionUuid,
        product_code: ESEWA_PRODUCT_CODE,
        product_service_charge: serviceChargeStr,
        product_delivery_charge: deliveryChargeStr,
        success_url: `http://localhost:5173/payment-success`,
        failure_url: `http://localhost:5173/payment-failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature,
        url: ESEWA_TEST_URL,
      },
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// Order Creation (COD)
// ==========================================

// @desc    Create Order (COD)
// @route   POST /api/orders/create
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { cartItems, userID, paymentMethod } = req.body;

    if (paymentMethod !== "COD") {
      return res
        .status(400)
        .json({ message: "This endpoint is for COD only." });
    }

    const transactionUuid = `${Date.now()}-${uuidv4()}`;
    const sellerGroups = groupCartItemsBySeller(cartItems);
    const createdOrders = [];
    const deliveryChargePerOrder = 100; // Rs. 100 per order

    // Fetch buyer details for log
    const buyer = await User.findById(userID);
    const buyerName = buyer?.name || "Buyer";

    // Enrich buyer object with Business Name and Location
    let businessName = null;
    let specificAddress = null;

    if (buyer) {
      if (buyer.role === "buyer") {
        const p = await Buyer.findOne({ userId: buyer._id });
        businessName = p?.companyName;
        specificAddress = p?.deliveryAddress;
      } else if (buyer.role === "collector") {
        const p = await Collector.findOne({ userId: buyer._id });
        businessName = p?.companyName;
        specificAddress = p?.location;
      } else if (buyer.role === "supplier") {
        const p = await Supplier.findOne({ userId: buyer._id });
        businessName = p?.companyName;
        specificAddress = p?.location;
      } else if (buyer.role === "farmer") {
        const p = await Farmer.findOne({ userId: buyer._id });
        businessName = p?.farmName;
      }
    }

    // Use specific address if available, otherwise fall back to user profile address
    const finalAddress = specificAddress || buyer.address || "Address not provided";
    const buyerForEmail = { ...buyer.toObject(), businessName, address: finalAddress };

    for (const sellerId in sellerGroups) {
      const group = sellerGroups[sellerId];
      const orderTotal = group.amount + deliveryChargePerOrder; // Add delivery charge

      const newOrder = new Order({
        orderID: `AGRM-${Math.floor(1000 + Math.random() * 9000)}`,
        buyerID: userID,
        sellerID: group.sellerId,
        products: group.products,
        totalAmount: orderTotal,
        deliveryCharge: deliveryChargePerOrder,
        status: "Pending",
        paymentStatus: "Pending",
        paymentMethod: "COD",
        transactionUUID: transactionUuid,
      });

      const savedOrder = await newOrder.save();
      createdOrders.push(savedOrder);

      // Create Transaction for All Seller Roles (Farmer, Collector, Supplier)
      const sellerUser = await User.findById(group.sellerId);
      const sellerRoles = ["farmer", "collector", "supplier"];

      if (sellerUser && sellerRoles.includes(sellerUser.role)) {
        const txn = await Transaction.create({
          sellerId: group.sellerId, // Who receives payment
          buyerId: userID, // Who makes payment
          amount: orderTotal, // Include delivery charge in transaction
          type: "Credit",
          paymentMethod: "COD",
          status: "Pending",
          description: `COD Order ${savedOrder.orderID}`,
          orderID: savedOrder.orderID,
        });
      }

      // Notify Seller of New Order
      emitToUser(group.sellerId, "order:new", savedOrder);
      // Notify Buyer (for multi-tab sync)
      emitToUser(userID, "order:new", savedOrder);

      // Log Activity
      await logActivity({
        type: "ORDER_PLACED",
        message: `Order #${savedOrder.orderID} Placed`,
        detail: `Placed by ${buyerName} (COD). Amount: ${savedOrder.totalAmount}`,
        userId: userID,
        metadata: {
          orderId: savedOrder._id,
          sellerId: group.sellerId,
          paymentMethod: "COD",
        },
      });

      // Send Email Notification to Seller
      if (sellerUser && sellerUser.email) {
        sendOrderEmail(savedOrder, sellerUser, buyerForEmail).catch((err) =>
          console.error(`Failed to send email to ${sellerUser.email}:`, err),
        );
      }
    }

    res.status(201).json({
      message: "COD Order created successfully",
      orders: createdOrders,
    });
  } catch (error) {
    console.error("Error creating COD order:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// Payment Verification & Order Creation (eSewa)
// ==========================================

// @desc    Verify Payment and Create Order (eSewa)
// @route   POST /api/orders/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { encodedData, cartItems, userID } = req.body;

    if (!encodedData) {
      return res.status(400).json({ message: "Missing payment data" });
    }

    const decodedData = JSON.parse(
      Buffer.from(encodedData, "base64").toString("utf-8"),
    );
    console.log("eSewa Payment Callback Data:", decodedData);

    const {
      status,
      signature,
      transaction_code,
      total_amount,
      transaction_uuid,
      product_code,
    } = decodedData;

    if (status !== "COMPLETE") {
      return res.status(400).json({ message: "Payment failed or incomplete" });
    }

    // 1. Verify Signature
    // eSewa sends signed_field_names to indicate which fields are included in signature
    const signedFieldNames =
      decodedData.signed_field_names ||
      "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names";

    // Build signature message using the exact fields eSewa signed
    const fields = signedFieldNames.split(",");
    const signatureMessage = fields
      .map((field) => `${field}=${decodedData[field]}`)
      .join(",");

    const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
    hmac.update(signatureMessage);
    const expectedSignature = hmac.digest("base64");

    if (signature !== expectedSignature) {
      console.error("Signature Mismatch:", {
        expected: expectedSignature,
        received: signature,
        message: signatureMessage,
        fields: fields,
      });
      // In production, uncomment the next line to strictly enforce signature
      // return res.status(400).json({ message: "Invalid signature" });
    } else {
      console.log("✅ Signature verified successfully");
    }

    // 2. Validate Cart Total matches Paid Amount
    const cartTotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    // Calculate delivery charge based on number of sellers
    const sellerGroups = groupCartItemsBySeller(cartItems);
    const numberOfOrders = Object.keys(sellerGroups).length;
    const deliveryChargePerOrder = 100;
    const totalDeliveryCharge = numberOfOrders * deliveryChargePerOrder;
    const grandTotal = cartTotal + totalDeliveryCharge;

    if (
      Math.abs(grandTotal - parseFloat(total_amount.replace(/,/g, ""))) > 1.0
    ) {
      return res
        .status(400)
        .json({ message: "Paid amount does not match cart total" });
    }

    // 3. Global Idempotency Check
    const existingOrdersGlobal = await Order.find({
      transactionUUID: transaction_uuid,
    });
    if (existingOrdersGlobal.length > 0) {
      console.log(
        `[Idempotency] Orders already exist for transaction ${transaction_uuid}`,
      );
      return res.json({
        message: "Payment verified (Existing Orders)",
        transaction_code,
        transaction_uuid,
        orders: existingOrdersGlobal,
      });
    }

    // 4. Create Operations (Separated for eSewa)
    // sellerGroups already declared above (line 238) for delivery charge calculation
    const createdOrders = [];

    // Fetch buyer details for log
    const purchaseUser = await User.findById(userID);
    const purchaseUserName = purchaseUser?.name || "Buyer";

    // Enrich buyer object with Business Name
    let businessName = null;
    if (purchaseUser) {
      if (purchaseUser.role === "buyer") {
        const p = await Buyer.findOne({ userId: purchaseUser._id });
        businessName = p?.companyName;
      } else if (purchaseUser.role === "collector") {
        const p = await Collector.findOne({ userId: purchaseUser._id });
        businessName = p?.companyName;
      } else if (purchaseUser.role === "supplier") {
        const p = await Supplier.findOne({ userId: purchaseUser._id });
        businessName = p?.companyName;
      } else if (purchaseUser.role === "farmer") {
        const p = await Farmer.findOne({ userId: purchaseUser._id });
        businessName = p?.farmName;
      }
    }
    const purchaseUserForEmail = { ...purchaseUser.toObject(), businessName };

    for (const sellerId in sellerGroups) {
      const group = sellerGroups[sellerId];

      // Per-Seller Idempotency Check (Race Condition Guard)
      const existingOrder = await Order.findOne({
        transactionUUID: transaction_uuid,
        sellerID: group.sellerId,
      });

      if (existingOrder) {
        console.log(
          `[Idempotency] Order already exists for seller ${group.sellerId}`,
        );
        createdOrders.push(existingOrder);
        continue;
      }

      try {
        // Create Order
        const deliveryChargePerOrder = 100; // Rs. 100 per order
        const orderTotal = group.amount + deliveryChargePerOrder;

        const newOrder = new Order({
          orderID: `AGRM-${Math.floor(1000 + Math.random() * 9000)}`,
          buyerID: userID,
          sellerID: group.sellerId,
          products: group.products,
          totalAmount: orderTotal,
          deliveryCharge: deliveryChargePerOrder,
          status: "Pending",
          paymentStatus: "Paid",
          paymentMethod: "eSewa",
          transactionUUID: transaction_uuid,
          transactionCode: transaction_code,
        });

        const savedOrder = await newOrder.save();
        createdOrders.push(savedOrder);

        // Handle Wallet & Transaction (All Seller Roles: Farmer, Collector, Supplier)
        const sellerUser = await User.findById(group.sellerId);
        const sellerRoles = ["farmer", "collector", "supplier"];

        if (sellerUser && sellerRoles.includes(sellerUser.role)) {
          // Atomic Wallet Update
          await Wallet.findOneAndUpdate(
            { userId: group.sellerId },
            {
              $inc: { lockedBalance: orderTotal }, // Include delivery charge
              $setOnInsert: {
                availableBalance: 0,
                totalEarnings: 0,
                pendingWithdrawals: 0,
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
          );

          // Record Locked Transaction
          await Transaction.create({
            sellerId: group.sellerId, // Who receives payment
            buyerId: userID, // Who makes payment
            amount: orderTotal, // Include delivery charge
            type: "Credit",
            paymentMethod: "eSewa",
            status: "Locked",
            description: `Online Payment for Order ${savedOrder.orderID}`,
            orderID: savedOrder.orderID,
          });
        }

        // Notify Seller of New Order
        emitToUser(group.sellerId, "order:new", savedOrder);
        // Notify Buyer
        emitToUser(userID, "order:new", savedOrder);

        // Log Activity
        await logActivity({
          type: "ORDER_PLACED",
          message: `Order #${savedOrder.orderID} Placed`,
          detail: `Placed by ${purchaseUserName} (eSewa). Amount: ${savedOrder.totalAmount}`,
          userId: userID,
          metadata: {
            orderId: savedOrder._id,
            sellerId: group.sellerId,
            paymentMethod: "eSewa",
          },
        });

        // Send Email Notification to Seller
        if (sellerUser && sellerUser.email) {
          sendOrderEmail(savedOrder, sellerUser, purchaseUserForEmail).catch((err) =>
            console.error(`Failed to send email to ${sellerUser.email}:`, err),
          );
        }
      } catch (duplicateError) {
        // Handle duplicate key error (E11000) - order already exists
        if (duplicateError.code === 11000) {
          console.log(
            `[DB Duplicate] Order already exists for seller ${group.sellerId}, transaction ${transaction_uuid}`,
          );
          // Fetch the existing order
          const existingOrder = await Order.findOne({
            transactionUUID: transaction_uuid,
            sellerID: group.sellerId,
          });
          if (existingOrder) {
            createdOrders.push(existingOrder);
          }
        } else {
          // Re-throw other errors
          throw duplicateError;
        }
      }
    }

    // Populate seller details for response
    const populatedOrders = await Promise.all(
      createdOrders.map(async (order) => {
        const orderObj = order.toObject ? order.toObject() : order;

        // Get seller user info
        const sellerUser = await User.findById(orderObj.sellerID);
        let sellerDetails = {
          name: sellerUser?.name || "Unknown Seller",
          role: sellerUser?.role || "unknown",
        };

        // Get business name based on role
        if (sellerUser) {
          if (sellerUser.role === "farmer") {
            const farmer = await Farmer.findOne({ userId: sellerUser._id });
            sellerDetails.businessName = farmer?.farmName || sellerUser.name;
          } else if (sellerUser.role === "collector") {
            const collector = await Collector.findOne({
              userId: sellerUser._id,
            });
            sellerDetails.businessName =
              collector?.companyName || sellerUser.name;
          } else if (sellerUser.role === "supplier") {
            const supplier = await Supplier.findOne({ userId: sellerUser._id });
            sellerDetails.businessName =
              supplier?.companyName || sellerUser.name;
          } else {
            sellerDetails.businessName = sellerUser.name;
          }
        }

        return {
          ...orderObj,
          sellerDetails,
        };
      }),
    );

    res.json({
      message: "Payment verified and order created successfully",
      transaction_code,
      transaction_uuid,
      orders: populatedOrders,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// Order Management (Get, Status, Confirm)
// ==========================================

// @desc    Get User Orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const { userID, role } = req.query; // role: 'buyer' or 'seller'

    let query = {};
    if (role === "seller") {
      query.sellerID = userID;
    } else {
      query.buyerID = userID;
    }

    // Use .lean() to get plain JS objects we can modify
    let orders = await Order.find(query)
      .populate("sellerID", "name email phone address role profileImage")
      .populate("buyerID", "name email phone address role profileImage")
      .sort({ createdAt: -1 })
      .lean();

    orders = await Promise.all(
      orders.map(async (order) => {
        // Enchant Seller Details
        if (order.sellerID) {
          let businessName = null;
          if (order.sellerID.role === "farmer") {
            const farmer = await Farmer.findOne({ userId: order.sellerID._id });
            if (farmer) businessName = farmer.farmName;
          } else if (order.sellerID.role === "collector") {
            const collector = await Collector.findOne({
              userId: order.sellerID._id,
            });
            if (collector) businessName = collector.companyName;
          } else if (order.sellerID.role === "supplier") {
            const supplier = await Supplier.findOne({
              userId: order.sellerID._id,
            });
            if (supplier) businessName = supplier.companyName;
          }
          order.sellerID.businessName = businessName || order.sellerID.name;
          order.sellerID.companyName = businessName || order.sellerID.name;
        }

        // Enchant Buyer Details
        if (order.buyerID) {
          let businessName = null;
          if (order.buyerID.role === "farmer") {
            const farmer = await Farmer.findOne({ userId: order.buyerID._id });
            if (farmer) businessName = farmer.farmName;
          } else if (order.buyerID.role === "collector") {
            const collector = await Collector.findOne({
              userId: order.buyerID._id,
            });
            if (collector) businessName = collector.companyName;
          } else if (order.buyerID.role === "supplier") {
            const supplier = await Supplier.findOne({
              userId: order.buyerID._id,
            });
            if (supplier) businessName = supplier.companyName;
          } else if (order.buyerID.role === "buyer") {
            const buyer = await Buyer.findOne({ userId: order.buyerID._id });
            if (buyer) businessName = buyer.companyName;
          }
          order.buyerID.businessName = businessName || order.buyerID.name;
          order.buyerID.companyName = businessName || order.buyerID.name;
        }

        return order;
      }),
    );

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Order Status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Sequence Validation
    const statusHierarchy = {
      Pending: 0,
      Accepted: 1,
      Processing: 2,
      Shipping: 3,
      Delivered: 4,
      Canceled: -1,
    };

    const currentStatusIdx = statusHierarchy[order.status];
    const newStatusIdx = statusHierarchy[status];

    // Status-specific validation
    if (status === "Rejected") {
      if (order.status !== "Pending") {
        return res.status(400).json({
          message: "Orders can only be rejected when they are Pending.",
        });
      }
    } else if (status === "Canceled") {
      // Canceled can only be set from Pending or Accepted
      if (currentStatusIdx > 1) {
        return res.status(400).json({
          message: `Cannot cancel order in ${order.status} state.`,
        });
      }
    } else {
      // Must follow sequence: Pending -> Accepted -> Processing -> Shipping -> Delivered
      if (newStatusIdx !== currentStatusIdx + 1) {
        return res.status(400).json({
          message: `Invalid status transition from ${order.status} to ${status}.`,
        });
      }
    }

    // Restock logic for Canceled/Rejected
    if (status === "Canceled" || status === "Rejected") {
      try {
        // Fetch seller to know which model to update
        const seller = await User.findById(order.sellerID);
        const Model = seller && seller.role === "farmer" ? Product : Inventory;

        console.log(
          `>>> Restocking items for ${status} order ${order.orderID} using ${Model.modelName} model`,
        );

        for (const item of order.products) {
          await Model.findByIdAndUpdate(item.productID, {
            $inc: { quantity: item.quantity },
          });
          console.log(
            `>>> Restored ${item.quantity} units to ${item.productName}`,
          );

          // Notify next level about restocked item
          if (Model.modelName === "Product") {
            emitToRole("collector", "dashboard:update", {
              type: "PRODUCT_RESTOCKED",
              productId: item.productID,
            });
          } else {
            // It's Inventory. Find collector or supplier
            const invUser = await User.findById(order.sellerID);
            if (invUser?.role === "collector") {
              emitToRole("supplier", "dashboard:update", {
                type: "INVENTORY_RESTOCKED",
                inventoryId: item.productID,
              });
            } else if (invUser?.role === "supplier") {
              emitToRole("buyer", "dashboard:update", {
                type: "INVENTORY_RESTOCKED",
                inventoryId: item.productID,
              });
            }
          }
        }
      } catch (restockErr) {
        console.error("Failed to restock items on status change:", restockErr);
      }
    }

    // Move from locked to available balance when Delivered
    if (status === "Delivered") {
      try {
        const seller = await User.findById(order.sellerID);
        const sellerRoles = ["farmer", "collector", "supplier"];

        if (seller && sellerRoles.includes(seller.role)) {
          const wallet = await Wallet.findOne({ userId: order.sellerID });

          if (order.paymentMethod === "eSewa") {
            if (wallet) {
              wallet.lockedBalance = Math.max(
                0,
                wallet.lockedBalance - order.totalAmount,
              );
              wallet.availableBalance += order.totalAmount;
              wallet.totalEarnings += order.totalAmount;
              await wallet.save();
            }

            // Update transaction status using orderID field
            await Transaction.findOneAndUpdate(
              { orderID: order.orderID, paymentMethod: "eSewa" },
              { status: "Completed" },
            );
          }
        }
      } catch (walletErr) {
        console.error("Failed to update wallet on delivery:", walletErr);
      }
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Signal Dashboard Update
    emitToUser(order.sellerID, "dashboard:update", {
      type: "ORDER_STATUS_CHANGED",
      order: updatedOrder,
    });
    emitToUser(order.buyerID, "dashboard:update", {
      type: "ORDER_STATUS_CHANGED",
      order: updatedOrder,
    });

    // Notify Buyer, Seller and Admin
    emitToUser(order.buyerID, "dashboard:update", {
      type: "ORDER_STATUS_UPDATED",
      order: updatedOrder,
    });
    emitToUser(order.sellerID, "dashboard:update", {
      type: "ORDER_STATUS_UPDATED",
      order: updatedOrder,
    });
    emitToRole("admin", "dashboard:update", {
      type: "ORDER_STATUS_UPDATED",
      order: updatedOrder,
    });

    // Log Activity
    let activityType = "ORDER_UPDATED";
    if (status === "Accepted") activityType = "ORDER_ACCEPTED";
    else if (status === "Processing") activityType = "ORDER_PROCESSING";
    else if (status === "Shipping") activityType = "ORDER_SHIPPED";
    else if (status === "Delivered") activityType = "ORDER_DELIVERED";
    else if (status === "Canceled") activityType = "ORDER_CANCELLED";
    else if (status === "Rejected") activityType = "ORDER_REJECTED";

    await logActivity({
      type: activityType,
      message: `Order #${updatedOrder.orderID} ${status}`,
      detail: `Status updated to ${status}`,
      userId: order.sellerID, // Seller usually updates status
      metadata: { orderId: updatedOrder._id, status, buyerId: order.buyerID }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm COD Payment (Buyer confirmation)
// @route   PUT /api/orders/:id/confirm-payment
// @access  Private
export const confirmCODPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Delivered") {
      return res
        .status(400)
        .json({ message: "Order must be Delivered before confirming payment" });
    }

    if (order.paymentMethod !== "COD") {
      return res
        .status(400)
        .json({ message: "Only COD orders can be confirmed this way" });
    }

    if (order.paymentStatus === "Paid") {
      return res
        .status(400)
        .json({ message: "Order is already marked as Paid" });
    }

    // Update Order Payment Status
    order.paymentStatus = "Paid";
    await order.save();

    // Update Seller's Transaction record to Completed using orderID field
    await Transaction.findOneAndUpdate(
      { orderID: order.orderID, paymentMethod: "COD" },
      { status: "Completed" },
    );

    // Signal Dashboard Update
    emitToUser(order.sellerID, "dashboard:update", {
      type: "PAYMENT_CONFIRMED",
      order,
    });
    emitToUser(order.buyerID, "dashboard:update", {
      type: "PAYMENT_CONFIRMED",
      order,
    });

    // Log Activity
    await logActivity({
      type: "COD_SETTLEMENT_COMPLETED",
      message: `COD Payment Confirmed`,
      detail: `Buyer confirmed payment for Order #${order.orderID}`,
      userId: order.buyerID,
      metadata: { orderId: order._id, transactionId: order.transactionUUID }
    });

    res.json({ message: "Payment confirmed successfully", order });
  } catch (error) {
    console.error("Error confirming COD payment:", error);
    res.status(500).json({ message: error.message });
  }
};
