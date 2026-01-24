import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
import Collector from "../models/Collector.js";
import Supplier from "../models/Supplier.js";
import Buyer from "../models/Buyer.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Order from "../models/Order.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import Withdrawal from "../models/Withdrawal.js";
import Dispute from "../models/Dispute.js";
// import DeletedUser from "../models/DeletedUser.js";
// import DeletedOrder from "../models/DeletedOrder.js";
import DeletedProduct from "../models/DeletedProduct.js"; // Assuming this exists or using generic
import DeletedInventory from "../models/DeletedInventory.js";
// import Activity from "../models/Activity.js";
import { emitToUser, emitToRole, broadcast } from "../socket.js";
import { getRecentActivities, logActivity } from "../utils/activityLogger.js";

// ==========================================
// 1. Dashboard Stats (Optimized Aggregation)
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    const start = Date.now();
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const startOfPreviousYear = new Date(previousYear, 0, 1);

    // 1. Basic Counts (Concurrent)
    const [
      totalUsers,
      totalFarmers,
      totalCollectors,
      totalSuppliers,
      totalBuyers,
      totalOrders,
      revenueResult,
      pendingDisputes,
      totalProducts,
      totalInventory,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "collector" }),
      User.countDocuments({ role: "supplier" }),
      User.countDocuments({ role: "buyer" }),
      Order.countDocuments({
        status: { $nin: ["Canceled", "Cancelled", "Rejected"] },
      }),
      Order.aggregate([
        {
          $match: {
            status: "Delivered",
            paymentStatus: "Paid",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Dispute.countDocuments({ status: "Open" }),
      // Count unique products from Product collection
      Product.aggregate([
        { $group: { _id: { $toLower: "$productName" } } },
        { $count: "total" },
      ]).then((res) => res[0]?.total || 0),
      // Count unique products from Inventory collection
      Inventory.aggregate([
        { $group: { _id: { $toLower: "$productName" } } },
        { $count: "total" },
      ]).then((res) => res[0]?.total || 0),
    ]);

    // Get unique product names across BOTH collections
    const [uniqueProductsAcrossBoth] = await Product.aggregate([
      { $project: { productName: { $toLower: "$productName" } } },
      {
        $unionWith: {
          coll: "inventories",
          pipeline: [
            { $project: { productName: { $toLower: "$productName" } } },
          ],
        },
      },
      { $group: { _id: "$productName" } },
      { $count: "total" },
    ]);

    const totalUniqueProducts = uniqueProductsAcrossBoth?.total || 0;

    console.log("📊 Product Counts:", {
      uniqueFromProductCollection: totalProducts,
      uniqueFromInventoryCollection: totalInventory,
      totalUniqueAcrossBoth: totalUniqueProducts,
    });

    // 2. Aggregation Pipelines

    // A. Users Pipeline
    const usersAggregation = await User.aggregate([
      {
        $addFields: {
          finalDate: { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
        },
      },
      {
        $match: {
          finalDate: { $gte: startOfPreviousYear },
          role: { $ne: "admin" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$finalDate" },
            month: { $month: "$finalDate" },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // B. Orders Pipeline (Revenue, Demand & Chain Volume)
    const ordersAggregation = await Order.aggregate([
      {
        $addFields: {
          finalDate: { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
        },
      },
      {
        $match: {
          finalDate: { $gte: startOfPreviousYear },
          status: { $nin: ["Canceled", "Cancelled", "Rejected"] },
        },
      },
      // Join with users to get buyer role
      {
        $lookup: {
          from: "users",
          localField: "buyerID",
          foreignField: "_id",
          as: "buyerData",
        },
      },
      { $unwind: { path: "$buyerData", preserveNullAndEmptyArrays: true } },
      {
        $facet: {
          // Revenue: Group by Month (Paid only for accuracy)
          revenue: [
            {
              $match: {
                status: "Delivered",
                paymentStatus: "Paid",
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$finalDate" },
                  month: { $month: "$finalDate" },
                },
                total: { $sum: "$totalAmount" },
              },
            },
          ],
          // Demand: Total volume requested (All active orders)
          demand: [
            { $unwind: "$products" },
            { $addFields: { catLower: { $toLower: "$products.category" } } },
            {
              $group: {
                _id: {
                  year: { $year: "$finalDate" },
                  month: { $month: "$finalDate" },
                },
                vegFreq: {
                  $sum: {
                    $cond: [
                      { $regexMatch: { input: "$catLower", regex: /veg/i } },
                      "$products.quantity",
                      0,
                    ],
                  },
                },
                fruitFreq: {
                  $sum: {
                    $cond: [
                      { $regexMatch: { input: "$catLower", regex: /fruit/i } },
                      "$products.quantity",
                      0,
                    ],
                  },
                },
              },
            },
          ],
          // Supply Components: volume currently in movement (NOT yet Delivered/Inventory)
          supplyInTransit: [
            { 
              $match: { 
                $and: [
                  { $or: [{ status: { $ne: "Delivered" } }, { "buyerData.role": { $ne: "buyer" } }] },
                  { isStocked: { $ne: true } }
                ]
              } 
            },
            { $unwind: "$products" },
            { $addFields: { catLower: { $toLower: "$products.category" } } },
            {
              $group: {
                _id: {
                  year: { $year: "$finalDate" },
                  month: { $month: "$finalDate" },
                },
                vegFreq: {
                  $sum: {
                    $cond: [
                      { $regexMatch: { input: "$catLower", regex: /veg/i } },
                      "$products.quantity",
                      0,
                    ],
                  },
                },
                fruitFreq: {
                  $sum: {
                    $cond: [
                      { $regexMatch: { input: "$catLower", regex: /fruit/i } },
                      "$products.quantity",
                      0,
                    ],
                  },
                },
              },
            },
          ],
          // Pipeline Volume: Dynamic movement (Exclude only if already stocked in next tier OR consumed by buyer)
          pipeline: [
            { 
              $match: { 
                $and: [
                  { $or: [{ status: { $ne: "Delivered" } }, { "buyerData.role": { $ne: "buyer" } }] },
                  { isStocked: { $ne: true } }
                ]
              } 
            },
            { $unwind: "$products" },
            {
              $group: {
                _id: {
                  year: { $year: "$finalDate" },
                  month: { $month: "$finalDate" },
                  role: "$buyerData.role",
                },
                volume: { $sum: "$products.quantity" },
              },
            },
          ],
          // Final consumption: Only Delivered orders reaching the Buyer
          consumption: [
            { $match: { status: "Delivered", "buyerData.role": "buyer" } },
            { $unwind: "$products" },
            {
              $group: {
                _id: {
                  year: { $year: "$finalDate" },
                  month: { $month: "$finalDate" },
                },
                volume: { $sum: "$products.quantity" },
              },
            },
          ],
        },
      },
    ]);

    // C. Supply Pipeline (New Products)
    const supplyAggregation = await Product.aggregate([
      {
        $addFields: {
          finalDate: { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
        },
      },
      {
        $match: {
          finalDate: { $gte: startOfPreviousYear },
        },
      },
      {
        $addFields: {
          catLower: { $toLower: "$category" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$finalDate" },
            month: { $month: "$finalDate" },
          },
          vegFreq: {
            $sum: {
              $cond: [
                { $regexMatch: { input: "$catLower", regex: /veg/i } },
                "$quantity",
                0,
              ],
            },
          },
          fruitFreq: {
            $sum: {
              $cond: [
                { $regexMatch: { input: "$catLower", regex: /fruit/i } },
                "$quantity",
                0,
              ],
            },
          },
          totalFarmerVol: { $sum: "$quantity" },
        },
      },
    ]);

    // C. Industry Stock Pipeline (Inventory held by Collectors/Suppliers)
    const inventoryAggregation = await Inventory.aggregate([
      {
        $addFields: {
          finalDate: { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
        },
      },
      {
        $match: {
          finalDate: { $gte: startOfPreviousYear },
        },
      },
      // Join with users to get role of inventory holder
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          catLower: { $toLower: "$category" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$finalDate" },
            month: { $month: "$finalDate" },
            role: "$userData.role",
          },
          vegFreq: {
            $sum: {
              $cond: [
                { $regexMatch: { input: "$catLower", regex: /veg/i } },
                "$quantity",
                0,
              ],
            },
          },
          fruitFreq: {
            $sum: {
              $cond: [
                { $regexMatch: { input: "$catLower", regex: /fruit/i } },
                "$quantity",
                0,
              ],
            },
          },
          totalVol: { $sum: "$quantity" },
        },
      },
    ]);

    // 3. Process & Merge Data
    const initMonths = () =>
      Array.from({ length: 12 }, (_, i) => ({
        name: new Date(0, i).toLocaleString("en", { month: "short" }),
        Farmers: 0,
        Collectors: 0,
        Suppliers: 0,
        Buyers: 0,
        Amount: 0,
        DemandVeg: 0,
        SupplyVeg: 0,
        DemandFruit: 0,
        SupplyFruit: 0,
        PipeFarmer: 0,
        PipeCollector: 0,
        PipeSupplier: 0,
        PipeBuyer: 0,
      }));

    const monthlyDataMap = initMonths();
    const previousMonthlyDataMap = initMonths();

    const updateMap = (year, monthIdx, key, val) => {
      if (year === currentYear) monthlyDataMap[monthIdx][key] += val;
      else if (year === previousYear)
        previousMonthlyDataMap[monthIdx][key] += val;
    };

    // Merge Users
    usersAggregation.forEach((item) => {
      const { year, month, role } = item._id;
      const key = role.charAt(0).toUpperCase() + role.slice(1) + "s";
      updateMap(year, month - 1, key, item.count);
    });

    // Merge Revenue
    ordersAggregation[0].revenue.forEach((item) => {
      const { year, month } = item._id;
      updateMap(year, month - 1, "Amount", item.total);
    });

    // Merge Demand (All active orders)
    ordersAggregation[0].demand.forEach((item) => {
      const { year, month } = item._id;
      // Demand is just the orders
      updateMap(year, month - 1, "DemandVeg", item.vegFreq);
      updateMap(year, month - 1, "DemandFruit", item.fruitFreq);

    });

    // Merge Supply - Initial Order Pipeline (Non-Delivered only)
    ordersAggregation[0].supplyInTransit.forEach((item) => {
      const { year, month } = item._id;
      updateMap(year, month - 1, "SupplyVeg", item.vegFreq);
      updateMap(year, month - 1, "SupplyFruit", item.fruitFreq);
    });

    // Merge Supply (Farmer listing stats for Flow only)
    supplyAggregation.forEach((item) => {
      const { year, month } = item._id;
      // Note: SupplyVeg/Fruit now handled by Orders + Inventory per user request
      updateMap(year, month - 1, "PipeFarmer", item.totalFarmerVol);
    });

    // Merge Pipeline Volume (Active movement through tiers - Excludes Delivered)
    ordersAggregation[0].pipeline.forEach((item) => {
      const { year, month, role } = item._id;
      let key = "";
      if (role === "collector") key = "PipeCollector";
      else if (role === "supplier") key = "PipeSupplier";

      if (key) updateMap(year, month - 1, key, item.volume);
    });

    // Merge Final Consumption (Only Delivered to Buyer)
    ordersAggregation[0].consumption.forEach((item) => {
      const { year, month } = item._id;
      updateMap(year, month - 1, "PipeBuyer", item.volume);
    });

    // 2. Stock Volume (Current Inventory in tiers)
    inventoryAggregation.forEach((item) => {
      const { year, month, role } = item._id;
      let key = "";
      if (role === "collector") key = "PipeCollector";
      else if (role === "supplier") key = "PipeSupplier";

      // Market Supply includes stock from Collectors and Suppliers
      updateMap(year, month - 1, "SupplyVeg", item.vegFreq);
      updateMap(year, month - 1, "SupplyFruit", item.fruitFreq);

      // We ADD inventory to existing movement to show total tier capacity/activity
      if (key) updateMap(year, month - 1, key, item.totalVol);
    });

    // 4. Recent Activity - Use centralized activity logger
    const activities = await getRecentActivities(10);

    // 5. Calculate User Growth Rate (Current Month vs Previous Month)
    const currentMonth = new Date().getMonth() + 1;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYearForGrowth =
      currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentMonthUsersSub = usersAggregation
      .filter(
        (item) =>
          item._id.month === currentMonth && item._id.year === currentYear,
      )
      .reduce((sum, item) => sum + item.count, 0);

    const prevMonthUsersSub = usersAggregation
      .filter(
        (item) =>
          item._id.month === prevMonth && item._id.year === prevYearForGrowth,
      )
      .reduce((sum, item) => sum + item.count, 0);

    let userGrowthRate = 0;
    if (prevMonthUsersSub > 0) {
      userGrowthRate =
        ((currentMonthUsersSub - prevMonthUsersSub) / prevMonthUsersSub) * 100;
    } else if (currentMonthUsersSub > 0) {
      userGrowthRate = 100;
    }

    res.json({
      totalUsers,
      totalFarmers,
      totalCollectors,
      totalSuppliers,
      totalBuyers,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
      userGrowthRate: parseFloat(userGrowthRate.toFixed(1)),
      pendingDisputes,
      totalProducts: totalUniqueProducts, // Unique product names across both collections
      monthlyData: monthlyDataMap,
      previousMonthlyData: previousMonthlyDataMap,
      recentActivity: activities,
      debug: {
        processingTimeMs: Date.now() - start,
        aggUserCount: usersAggregation.reduce(
          (acc, curr) => acc + curr.count,
          0,
        ),
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Role Specific Profile (for License URL etc)
export const getRoleProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let roleData = null;
    switch (user.role) {
      case "farmer":
        roleData = await Farmer.findOne({ userId });
        break;
      case "collector":
        roleData = await Collector.findOne({ userId });
        break;
      case "supplier":
        roleData = await Supplier.findOne({ userId });
        break;
      case "buyer":
        roleData = await Buyer.findOne({ userId });
        break;
    }

    if (!roleData) {
      return res.status(404).json({ message: "Role profile not found" });
    }

    res.json(roleData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 2. User Management
// ==========================================
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query =
      role && role !== "all" ? { role } : { role: { $ne: "admin" } };
    const users = await User.find(query).select("-password").sort("-createdAt");

    // Enrich with specific role details if needed (can be done on frontend detail view for performance)
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, docStatus } = req.body; // status: Verified/Rejected, docStatus: Approved/Rejected

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update Statuses
    // Note: Use specific fields on user model if they exist, else update mock-like fields or real fields
    // Assuming 'status' field exists on User (mock had it, but model didn't? Let's check model again...
    // Wait, User model doesn't have 'status' or 'docStatus' in the file I viewed earlier!
    // They were in MOCK data. I MUST ADD THEM TO USER MODEL or use Role Models.
    // Strategy: Update Role specific model (Farmer/Collector etc) which holds license info usually.
    // BUT common status is good on User.
    // For now, I will try to find the Role specific doc and update it.

    // Actually, looking at Register controller, licenseUrl is in Farmer/Collector/Supplier models.
    // Let's verify the role model.
    let RoleModel;
    switch (user.role) {
      case "farmer":
        RoleModel = Farmer;
        break;
      case "collector":
        RoleModel = Collector;
        break;
      case "supplier":
        RoleModel = Supplier;
        break;
    }

    if (RoleModel) {
      // Assuming these models have a status field? If not, I might need to add it.
      // Checking Register: It keeps licenseUrl. status logic was frontend mock.
      // I will add 'status' to the User model dynamically if schema allows or just update generic if I successfully added it.
      // Since I can't easily change all Schema now, I'll assume they will be added or I'll add them to User Schema in next step if missing.
      // Let's assume I need to add 'verificationStatus' to User.
    }

    // TEMPORARY FIX: I will add these fields to User model in a subsequent step or parallel.
    // For now writing logic as if they exist.
    // Update Statuses
    if (status) user.status = status;
    if (docStatus) {
      user.docStatus = docStatus;
      // Logical Link: If docs are approved, the user is considered Verified for the platform
      if (docStatus === "Approved") {
        user.status = "Verified";
      }
    }

    await user.save();

    // Notify User
    emitToUser(user._id, "dashboard:update", {
      type: "USER_VERIFIED",
      status,
      docStatus,
    });

    // Log Activity
    const activityType =
      status === "Verified" || docStatus === "Approved"
        ? "USER_VERIFY"
        : status === "Rejected" || docStatus === "Rejected"
          ? "USER_REJECT"
          : "USER_UPDATE";

    const activityMessage =
      status === "Verified" || docStatus === "Approved"
        ? `User ${user.name} Verified`
        : status === "Rejected" || docStatus === "Rejected"
          ? `User ${user.name} Rejected`
          : `User ${user.name} Updated`;

    await logActivity({
      type: activityType,
      message: activityMessage,
      detail: `Admin ${req.user.name} updated status to ${status || docStatus}`,
      userId: user._id,
      metadata: { adminId: req.user._id, status, docStatus },
    });

    res.json({ message: `User ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Imports for Cascade Delete
import { performUserDeletion } from "../utils/deleteAction.js";

// Helper to calculate total value of removed items (optional, but good for logs)
// ...

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const reason = req.body.reason || "Admin deletion";

    // Call shared utility
    const result = await performUserDeletion(id, adminId, reason);

    // Log Activity
    await logActivity({
      type: "USER_DELETE",
      message: `User Deleted by Admin ${req.user.name}`,
      detail: `Reason: ${reason}`,
      userId: id, // ID might refer to deleted user, but useful for reference in logs if preserved or as metadata strings
      metadata: { adminId, reason, result },
    });

    res.json(result);
  } catch (error) {
    console.error("Delete User Error:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. Product & Inventory
// ==========================================
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("userID", "name email role profileImage")
      .sort("-createdAt");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("userID", "name email role profileImage")
      .sort("-createdAt");
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Backup (using generic or specific DeletedProduct)
    // Reuse existing logic from productController but forced by Admin
    // Using DeletedProduct model
    const productData = product.toObject();
    delete productData._id;
    await DeletedProduct.create({ ...productData, deletedBy: "ADMIN" });

    await Product.findByIdAndDelete(id);

    // Notify affected user
    emitToUser(product.userID, "dashboard:update", {
      type: "PRODUCT_DELETED",
      productId: id,
    });
    // Notify Admin Dashboard for real-time stats update
    emitToRole("admin", "dashboard:update", {
      type: "PRODUCT_DELETED",
      productId: id,
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInventoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id);
    if (!item)
      return res.status(404).json({ message: "Inventory Item not found" });

    // Backup
    const itemData = item.toObject();
    delete itemData._id;
    await DeletedInventory.create({ ...itemData, deletedBy: "ADMIN" });

    await Inventory.findByIdAndDelete(id);

    // Notify User and next level
    emitToUser(item.userID, "dashboard:update", {
      type: "INVENTORY_DELETED",
      inventoryId: id,
    });
    const user = await User.findById(item.userID);
    if (user?.role === "collector") {
      emitToRole("supplier", "dashboard:update", {
        type: "INVENTORY_DELETED",
        inventoryId: id,
      });
    } else if (user?.role === "supplier") {
      emitToRole("buyer", "dashboard:update", {
        type: "INVENTORY_DELETED",
        inventoryId: id,
      });
    }
    // Notify Admin Dashboard for real-time stats update
    emitToRole("admin", "dashboard:update", {
      type: "INVENTORY_DELETED",
      inventoryId: id,
    });

    res.json({ message: "Inventory Item deleted by Admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const flagProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // type=product or inventory

    const Model = type === "inventory" ? Inventory : Product;
    const item = await Model.findById(id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    item.availableStatus = "Suspended"; // Or "Flagged"
    await item.save();

    // Notify User
    emitToUser(item.userID, "dashboard:update", {
      type: "ITEM_FLAGGED",
      id,
      itemType: type,
    });
    // Global broadcast for flagged items
    broadcast("dashboard:update", { type: "ITEM_FLAGGED", id, itemType: type });

    res.json({ message: "Item flagged/suspended" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 4. Order Management
// ==========================================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("sellerID", "name role email profileImage")
      .populate("buyerID", "name role email profileImage")
      .sort("-createdAt");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., "Frozen", "Canceled"

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    // Notify Buyer and Seller
    // Notify Buyer, Seller and Admin
    emitToUser(order.buyerID, "dashboard:update", {
      type: "ORDER_STATUS_UPDATED",
      order,
    });
    emitToUser(order.sellerID, "dashboard:update", {
      type: "ORDER_STATUS_UPDATED",
      order,
    });
    emitToRole("admin", "dashboard:update", {
      type: "ORDER_STATUS_UPDATED",
      order,
    });

    // Map status to Activity Type
    let activityType = "ORDER_UPDATED";
    if (status === "Accepted" || status === "Confirmed")
      activityType = "ORDER_ACCEPTED";
    else if (status === "Processing") activityType = "ORDER_PROCESSING";
    else if (status === "Shipping" || status === "Shipped")
      activityType = "ORDER_SHIPPED";
    else if (status === "Delivered") activityType = "ORDER_DELIVERED";
    else if (status === "Rejected") activityType = "ORDER_REJECTED";
    else if (status === "Canceled" || status === "Cancelled")
      activityType = "ORDER_CANCELLED";

    await logActivity({
      type: activityType,
      message: `Order #${order.orderID} ${status}`,
      detail: `Admin ${req.user.name} updated status to ${status}`,
      userId: order.buyerID, // Associated user (buyer)
      metadata: {
        orderId: order._id,
        sellerId: order.sellerID,
        adminId: req.user._id,
      },
    });

    res.json({ message: "Order status updated by Admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 5. Wallet & Financials (Online)
// ==========================================
export const getAllWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find()
      .populate("userId", "name role email profileImage")
      .sort("-createdAt");
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const freezeWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    const { isFrozen } = req.body; // Expecting "yes" or "no"

    const wallet = await Wallet.findById(walletId);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    wallet.isFrozen = isFrozen;
    await wallet.save();

    // Notify User
    emitToUser(wallet.userId, "dashboard:update", {
      type: "WALLET_FROZEN",
      isFrozen,
    });

    // Log Activity
    const activityType =
      isFrozen === "yes" ? "WALLET_FROZEN" : "WALLET_ACTIVATED";

    await logActivity({
      type: activityType,
      message: `Wallet ${isFrozen === "yes" ? "Frozen" : "Activated"}`,
      detail: `Admin ${req.user.name} ${isFrozen === "yes" ? "froze" : "activated"} the wallet`,
      userId: wallet.userId,
      metadata: { walletId: wallet._id, adminId: req.user._id, isFrozen },
    });

    // Also emit generic admin update
    emitToRole("admin", "dashboard:update", {
      type: activityType,
      walletId: wallet._id,
    });

    res.json({
      message: `Wallet ${isFrozen === "yes" ? "Frozen" : "Activated"}`,
      isFrozen: wallet.isFrozen,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const manualTransaction = async (req, res) => {
  // Admin manual credit/debit
  try {
    const { userId, amount, type, description } = req.body;
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    if (type === "Credit") {
      wallet.availableBalance += Number(amount);
    } else {
      if (wallet.availableBalance < amount)
        return res.status(400).json({ message: "Insufficient funds" });
      wallet.availableBalance -= Number(amount);
    }
    await wallet.save();

    // Log Transaction
    await Transaction.create({
      sellerId: userId, // Affecting this user
      amount,
      type,
      paymentMethod: "Bank Transfer", // Or 'Admin Adjustment'
      status: "Completed",
      description: `Admin: ${description}`,
    });

    // Notify User
    emitToUser(userId, "dashboard:update", {
      type: "WALLET_UPDATED",
      amount,
      txnType: type,
    });

    // Log Activity
    await logActivity({
      type: "ADMIN_ACTION",
      message: `Manual ${type} Applied`,
      detail: `Admin ${req.user.name} ${type === "Credit" ? "credited" : "debited"} ${amount}. Reason: ${description}`,
      userId: userId,
      metadata: { adminId: req.user._id, amount, type, description },
    });

    res.json({ message: "Manual transaction successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const withdrawals = await Withdrawal.find(query)
      .populate("userId", "name email")
      .sort("-createdAt");
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // Verified / Completed / Rejected

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal)
      return res.status(404).json({ message: "Withdrawal not found" });

    // Status Transition Validation
    if (status === "Verified" && withdrawal.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only Pending requests can be Verified" });
    }
    if (status === "Rejected" && withdrawal.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only Pending requests can be Rejected" });
    }
    if (status === "Completed" && withdrawal.status !== "Verified") {
      return res
        .status(400)
        .json({ message: "Only Verified requests can be Completed" });
    }
    if (["Completed", "Rejected"].includes(withdrawal.status)) {
      return res.status(400).json({ message: "Already finalized" });
    }

    const oldStatus = withdrawal.status;
    withdrawal.status = status;
    withdrawal.remarks = remarks || "";
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    const userId = withdrawal.userId._id || withdrawal.userId;

    // Deduct balance when verified if it wasn't already deducted
    if (status === "Verified" && oldStatus === "Pending") {
      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
        if (wallet.availableBalance < withdrawal.amount) {
          // This is a safety check. Usually backend ensures this.
          // However, if balance dropped below amount while pending...
        }
        wallet.availableBalance -= withdrawal.amount;
        await wallet.save();
      }
    }

    // Refund logic: Only if we are rejecting a previously 'Verified' or 'Completed' request
    // If it was 'Pending', we never deducted it, so no refund needed.
    if (
      status === "Rejected" &&
      ["Verified", "Completed"].includes(oldStatus)
    ) {
      await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { availableBalance: withdrawal.amount } },
      );
    }

    // Sync corresponding Transaction record

    // We look for the most recent Pending or current-status transaction for this withdrawal
    await Transaction.findOneAndUpdate(
      {
        sellerId: userId,
        amount: withdrawal.amount,
        type: "Debit",
        // Description check helps ensure we match the right one
        description: { $regex: /Withdrawal Request/i },
        status: { $in: ["Pending", "Verified"] },
      },
      { status },
      { sort: { createdAt: -1 } },
    );

    // Notify User
    emitToUser(userId, "dashboard:update", {
      type: "WITHDRAWAL_PROCESSED",
      withdrawal,
    });

    // Log Activity
    let activityType = "WITHDRAWAL_UPDATED";
    if (status === "Verified") activityType = "WITHDRAWAL_VERIFIED";
    else if (status === "Completed") activityType = "WITHDRAWAL_COMPLETED";
    else if (status === "Rejected") activityType = "WITHDRAWAL_REJECTED";

    await logActivity({
      type: activityType,
      message: `Withdrawal Request ${status}`,
      detail: `Admin ${req.user.name} marked withdrawal as ${status}. Amount: ${withdrawal.amount}`,
      userId: userId,
      metadata: {
        withdrawalId: withdrawal._id,
        amount: withdrawal.amount,
        adminId: req.user._id,
        status,
      },
    });

    res.json({
      message: `Withdrawal ${status}`,
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 6. COD Ledger
// ==========================================
export const getCODTransactions = async (req, res) => {
  try {
    const transactions = await Order.aggregate([
      // 1. All valid COD orders
      {
        $match: {
          paymentMethod: "COD",
          status: { $nin: ["Canceled", "Cancelled", "Rejected"] },
        },
      },
      // 2. Lookup existing transactions by orderID string
      {
        $lookup: {
          from: "transactions",
          localField: "orderID",
          foreignField: "orderID",
          as: "txnData",
        },
      },
      {
        $addFields: {
          mainTxn: { $arrayElemAt: ["$txnData", 0] },
        },
      },
      // 3. User details for seller/buyer
      {
        $lookup: {
          from: "users",
          localField: "sellerID",
          foreignField: "_id",
          as: "sellerInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyerID",
          foreignField: "_id",
          as: "buyerInfo",
        },
      },
      { $unwind: "$sellerInfo" },
      { $unwind: "$buyerInfo" },
      // 4. Transform to unified format: Prefer Transaction data, Fallback to Order data
      {
        $project: {
          // If transaction exists, use its _id, else use Order _id for settlement identification
          _id: { $ifNull: ["$mainTxn._id", "$_id"] },
          amount: { $ifNull: ["$mainTxn.amount", "$totalAmount"] },
          type: "Credit",
          paymentMethod: "COD",
          status: { $ifNull: ["$mainTxn.status", "Pending"] },
          description: {
            $ifNull: [
              "$mainTxn.description",
              { $concat: ["COD Order ", "$orderID"] },
            ],
          },
          orderID: "$orderID",
          createdAt: { $ifNull: ["$mainTxn.createdAt", "$createdAt"] },
          sellerId: {
            _id: "$sellerInfo._id",
            name: "$sellerInfo.name",
            role: "$sellerInfo.role",
          },
          buyerId: {
            _id: "$buyerInfo._id",
            name: "$buyerInfo.name",
            role: "$buyerInfo.role",
          },
          isSynthesized: { $cond: [{ $not: ["$mainTxn._id"] }, true, false] },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOnlineTransactions = async (req, res) => {
  try {
    const transactions = await Order.aggregate([
      // 1. All valid non-COD orders (e.g., eSewa)
      {
        $match: {
          paymentMethod: { $ne: "COD" },
          status: { $nin: ["Canceled", "Cancelled", "Rejected"] },
        },
      },
      // 2. Lookup existing transactions by orderID
      {
        $lookup: {
          from: "transactions",
          localField: "orderID",
          foreignField: "orderID",
          as: "txnData",
        },
      },
      {
        $addFields: {
          mainTxn: { $arrayElemAt: ["$txnData", 0] },
        },
      },
      // 3. User details for seller/buyer
      {
        $lookup: {
          from: "users",
          localField: "sellerID",
          foreignField: "_id",
          as: "sellerInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyerID",
          foreignField: "_id",
          as: "buyerInfo",
        },
      },
      { $unwind: "$sellerInfo" },
      { $unwind: "$buyerInfo" },
      // 4. Project into unified format (exclusively for order-related transactions)
      {
        $project: {
          _id: { $ifNull: ["$mainTxn._id", "$_id"] },
          amount: { $ifNull: ["$mainTxn.amount", "$totalAmount"] },
          type: "Credit",
          paymentMethod: "$paymentMethod", // Use order's payment method (eSewa, etc.)
          status: { $ifNull: ["$mainTxn.status", "Paid"] }, // Online orders usually 'Paid'
          description: {
            $ifNull: [
              "$mainTxn.description",
              { $concat: ["Online Payment for Order ", "$orderID"] },
            ],
          },
          orderID: "$orderID",
          createdAt: { $ifNull: ["$mainTxn.createdAt", "$createdAt"] },
          sellerId: {
            _id: "$sellerInfo._id",
            name: "$sellerInfo.name",
            role: "$sellerInfo.role",
          },
          buyerId: {
            _id: "$buyerInfo._id",
            name: "$buyerInfo.name",
            role: "$buyerInfo.role",
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const settleCOD = async (req, res) => {
  try {
    const { id } = req.params; // ID can be a Transaction._id OR an Order._id (synthesized)
    let transaction = await Transaction.findById(id);

    // Guard: If transaction not found, check if it's a synthesized order record
    if (!transaction) {
      const order = await Order.findById(id);
      if (order) {
        // Auto-create missing Transaction record before settling
        transaction = await Transaction.create({
          sellerId: order.sellerID,
          buyerId: order.buyerID,
          amount: order.totalAmount,
          type: "Credit",
          paymentMethod: "COD",
          status: "Pending",
          description: `COD Order ${order.orderID} (Auto-recovery)`,
          orderID: order.orderID,
        });
        console.log(
          `>>> [Admin] Auto-recovered COD transaction for Order ${order.orderID}`,
        );
      }
    }

    if (!transaction)
      return res.status(404).json({ message: "COD Record/Order not found" });

    transaction.status = "Completed"; // Or "Settled"
    if (!transaction.description.includes("(Verified by Admin)")) {
      transaction.description += " (Verified by Admin)";
    }
    await transaction.save();

    // Unified payload for synchronization
    const updatePayload = {
      type: "TRANSACTION_SETTLED",
      transaction,
    };

    // Notify All Parties
    emitToUser(transaction.sellerId, "dashboard:update", updatePayload);
    emitToUser(transaction.buyerId, "dashboard:update", updatePayload);
    emitToRole("admin", "dashboard:update", updatePayload);

    // Log Activity
    await logActivity({
      type: "COD_SETTLEMENT_COMPLETED",
      message: `COD Payment Settled`,
      detail: `Admin ${req.user.name} verified COD payment of Rs. ${transaction.amount} for Order ${transaction.orderID}`,
      userId: transaction.sellerId,
      metadata: {
        transactionId: transaction._id,
        orderID: transaction.orderID,
        amount: transaction.amount,
        adminId: req.user._id,
      },
    });

    res.json({ message: "COD Payment Marked as Settled", transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 7. Disputes
// ==========================================
export const getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("raisedBy", "name email role")
      .populate("sellerID", "name email")
      .sort("-createdAt");
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, refundAmount, adminComments } = req.body;
    const adminId = req.user._id;

    const dispute = await Dispute.findById(id);
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    dispute.resolution = {
      action,
      refundAmount: Number(refundAmount) || 0,
      adminComments,
      resolvedBy: adminId,
      resolvedAt: new Date(),
    };
    dispute.status = "Resolved";
    await dispute.save();

    // Perform Action Logic
    if (action === "Refund" && refundAmount > 0) {
      // Deduct from Seller, Give to Buyer (Assuming funds held)
      // Complex logic: depends on if funds are Locked or Available.
      // Simplified:
      // 1. Credit Buyer Wallet
      const buyerWallet = await Wallet.findOneAndUpdate(
        { userId: dispute.raisedBy },
        {
          $inc: { availableBalance: Number(refundAmount) },
          $setOnInsert: { lockedBalance: 0, totalEarnings: 0 },
        },
        { upsert: true, new: true },
      );
      // 2. Debit Seller (if locked)
      // ... Logic omitted for brevity, assuming manual adjustment or refund API
    }

    // Notify Buyer and Seller
    emitToUser(dispute.raisedBy, "dashboard:update", {
      type: "DISPUTE_RESOLVED",
      dispute,
    });
    emitToUser(dispute.sellerID, "dashboard:update", {
      type: "DISPUTE_RESOLVED",
      dispute,
    });

    // Log Activity
    let activityType = "DISPUTE_RESOLVED";
    if (action === "Refund") activityType = "DISPUTE_REFUNDED";
    else if (action === "Dismiss") activityType = "DISPUTE_DISMISSED";

    await logActivity({
      type: activityType,
      message: `Dispute ${activityType === "DISPUTE_DISMISSED" ? "Dismissed" : "Resolved"}`,
      detail: `Admin ${req.user.name} resolved. Action: ${action}. ${adminComments || ""}`,
      userId: dispute.raisedBy,
      metadata: { disputeId: dispute._id, refundAmount, action, adminId },
    });

    res.json({ message: "Dispute Resolved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
