import Dispute from "../models/Dispute.js";
import User from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";
import { emitToRole } from "../socket.js";

/**
 * @desc    Create a new dispute
 * @route   POST /api/disputes
 * @access  Private
 */
export const createDispute = async (req, res) => {
  try {
    const { 
      orderID, 
      withdrawalID, 
      transactionUUID, 
      sellerID, 
      reason, 
      description
    } = req.body;

    const userID = req.user._id;

    // Sanitize common fields (handle possible arrays from multipart/form-data)
    const sanitize = (val) => (Array.isArray(val) ? val[0] : val);

    let sOrderID = sanitize(orderID);
    let sWithdrawalID = sanitize(withdrawalID);
    let sTransactionUUID = sanitize(transactionUUID);
    let sSellerID = sanitize(sellerID);

    // Filter out empty strings
    if (sSellerID === "") sSellerID = undefined;

    // Handle evidence images from Cloudinary (multer-storage-cloudinary)
    let finalEvidenceImages = [];
    if (req.files && req.files.length > 0) {
      console.log("Files received in backend:", req.files.length);
      finalEvidenceImages = req.files.map(file => file.path);
    }

    // Basic validation
    if (!reason || !description) {
      return res.status(400).json({ message: "Reason and description are required" });
    }

    if (!sOrderID && !sWithdrawalID && !sTransactionUUID) {
      return res.status(400).json({ 
        message: "Dispute must be linked to an order, withdrawal, or transaction" 
      });
    }

    const dispute = new Dispute({
      orderID: sOrderID,
      withdrawalID: sWithdrawalID,
      transactionUUID: sTransactionUUID,
      raisedBy: userID,
      sellerID: sSellerID,
      reason,
      description,
      evidenceImages: finalEvidenceImages,
      status: "Open"
    });

    const savedDispute = await dispute.save();

    // Log Activity
    await logActivity({
      type: "DISPUTE_RAISED",
      message: `Dispute raised for ${orderID || withdrawalID || "transaction"}`,
      detail: `Reason: ${reason}. Description: ${description}`,
      userId: userID,
      metadata: { disputeId: savedDispute._id, orderID, withdrawalID }
    });

    // Notify Admins via Socket
    emitToRole("Admin", "dashboard:update", {
      type: "NEW_DISPUTE",
      dispute: savedDispute,
      message: `New dispute raised by ${req.user.name}`
    });

    res.status(201).json(savedDispute);
  } catch (error) {
    console.error("Error creating dispute:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all disputes for the logged-in user
 * @route   GET /api/disputes/my
 * @access  Private
 */
export const getMyDisputes = async (req, res) => {
  try {
    const userID = req.user._id;
    const disputes = await Dispute.find({ raisedBy: userID })
      .sort("-createdAt");
    
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get dispute by ID
 * @route   GET /api/disputes/:id
 * @access  Private
 */
export const getDisputeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user._id;

    const dispute = await Dispute.findById(id).populate("raisedBy", "name email role");

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    // Check if user is authorized (Owner or Admin)
    if (dispute.raisedBy._id.toString() !== userID.toString() && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized to view this dispute" });
    }

    res.json(dispute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
