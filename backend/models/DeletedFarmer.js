import mongoose from "mongoose";
import { backupConnection } from "../config/db.js";

const deletedFarmerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmName: { type: String, required: true },
    farmRegistrationNumber: { type: String, required: true },
    licenseUrl: { type: String },
    paymentDetails: {
      method: { type: String, required: true },
      gatewayId: { type: String, required: true },
    },
    deletedBy: { type: String, default: "ADMIN" },
    originalCreatedAt: { type: Date },
  },
  { timestamps: true },
);

const DeletedFarmer = backupConnection.model(
  "DeletedFarmer",
  deletedFarmerSchema,
);
export default DeletedFarmer;
