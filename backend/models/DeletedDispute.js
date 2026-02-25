import mongoose from "mongoose";
import { backupConnection } from "../config/db.js";

const deletedDisputeSchema = new mongoose.Schema(
  {
    orderID: {
      type: String,
      required: true,
    },
    transactionUUID: {
      type: String,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    sellerID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    reason: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
    },
    resolution: {
      action: {
        type: String,
      },
      adminComments: String,
      refundAmount: Number,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
      },
      resolvedAt: Date,
    },
    evidenceImages: [String],
    deletedBy: {
      type: String,
    },
    originalCreatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const DeletedDispute = backupConnection.model("DeletedDispute", deletedDisputeSchema);
export default DeletedDispute;
