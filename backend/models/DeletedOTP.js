import mongoose from "mongoose";
import { backupConnection } from "../config/db.js";

const deletedOTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  deletedBy: { type: String },
  originalCreatedAt: {
    type: Date,
  },
}, { timestamps: true });

const DeletedOTP = backupConnection.model("DeletedOTP", deletedOTPSchema);
export default DeletedOTP;
