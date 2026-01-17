import mongoose from 'mongoose';
import { backupConnection } from "../config/db.js";

const deletedSupplierSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  companyName: { type: String, required: true },
  businessRegistrationNumber: { type: String, required: true },
  location: { type: String, required: true },
  licenseUrl: { type: String },
  paymentDetails: {
    method: { type: String, required: true },
    gatewayId: { type: String, required: true }
  },
  deletedBy: { type: String, default: "ADMIN" },
  originalCreatedAt: { type: Date }
}, { timestamps: true });

const DeletedSupplier = backupConnection.model('DeletedSupplier', deletedSupplierSchema);
export default DeletedSupplier;
