import User from "../models/User.js";
import Product from "../models/Product.js";
import Farmer from "../models/Farmer.js";
import Inventory from "../models/Inventory.js";
import Collector from "../models/Collector.js";
import Supplier from "../models/Supplier.js";

// @desc    Get farmers who have added at least one product with their farm details
// @route   GET /api/users/active-farmers
// @access  Public
export const getActiveFarmers = async (req, res) => {
  try {
    // Aggregation to find users who:
    // 1. Are farmers
    // 2. Have products
    // 3. Join with their Farmer profile for farmName
    
    // First get unique userIDs of farmers who have products
    const activeFarmerIDs = await Product.distinct("userID");

    const activeFarmers = await User.aggregate([
      {
        $match: {
          _id: { $in: activeFarmerIDs },
          role: "farmer"
        }
      },
      {
        $lookup: {
          from: "farmers", // collection name for Farmer model
          localField: "_id",
          foreignField: "userId",
          as: "farmDetails"
        }
      },
      {
        $unwind: {
          path: "$farmDetails",
          preserveNullAndEmptyArrays: true // In case some farmer hasn't filled profile yet
        }
      },
      {
        $project: {
          password: 0,
          __v: 0,
          "farmDetails.__v": 0,
          "farmDetails.userId": 0
        }
      }
    ]);

    res.status(200).json(activeFarmers);
  } catch (error) {
    console.error("Error in getActiveFarmers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get collectors who have added at least one inventory item with their company details
// @route   GET /api/users/active-collectors
// @access  Public
export const getActiveCollectors = async (req, res) => {
  try {
    // First get unique userIDs of collectors who have inventory
    const activeCollectorIDs = await Inventory.distinct("userID");

    const activeCollectors = await User.aggregate([
      {
        $match: {
          _id: { $in: activeCollectorIDs },
          role: "collector"
        }
      },
      {
        $lookup: {
          from: "collectors", // collection name for Collector model
          localField: "_id",
          foreignField: "userId",
          as: "collectorDetails"
        }
      },
      {
        $unwind: {
          path: "$collectorDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          password: 0,
          __v: 0,
          "collectorDetails.__v": 0,
          "collectorDetails.userId": 0
        }
      }
    ]);

    res.status(200).json(activeCollectors);
  } catch (error) {
    console.error("Error in getActiveCollectors:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get distributors (suppliers) who have added at least one inventory item with their company details
// @route   GET /api/users/active-distributors
// @access  Public
export const getActiveDistributors = async (req, res) => {
  try {
    // First get unique userIDs of suppliers who have inventory
    const activeSupplierIDs = await Inventory.distinct("userID");

    const activeDistributors = await User.aggregate([
      {
        $match: {
          _id: { $in: activeSupplierIDs },
          role: "supplier"
        }
      },
      {
        $lookup: {
          from: "suppliers", // collection name for Supplier model
          localField: "_id",
          foreignField: "userId",
          as: "supplierDetails"
        }
      },
      {
        $unwind: {
          path: "$supplierDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          password: 0,
          __v: 0,
          "supplierDetails.__v": 0,
          "supplierDetails.userId": 0
        }
      }
    ]);

    res.status(200).json(activeDistributors);
  } catch (error) {
    console.error("Error in getActiveDistributors:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
