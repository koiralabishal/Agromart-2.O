import mongoose from "mongoose";
import { backupConnection } from "../config/db.js";

const deletedWithdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Approved", "Completed", "Rejected"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: [
        "eSewa",
        "esewa",
        "Khalti",
        "khalti",
        "Bank Transfer",
        "bank transfer",
      ],
      required: true,
    },
    accountDetails: {
      type: String,
      required: true,
    },
    processedAt: {
      type: Date,
    },
    remarks: {
      type: String,
    },
    deletedBy: { type: String, default: "ADMIN" },
    originalCreatedAt: { type: Date },
  },
  { timestamps: true },
);

const DeletedWithdrawal = backupConnection.model(
  "DeletedWithdrawal",
  deletedWithdrawalSchema,
);
export default DeletedWithdrawal;
