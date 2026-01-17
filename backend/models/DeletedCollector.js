import mongoose from 'mongoose';
import { backupConnection } from "../config/db.js";

const deletedCollectorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  companyName: { type: String, required: true },
  location: { type: String, required: true },
  licenseUrl: { type: String },
  paymentDetails: {
    method: { type: String, required: true },
    gatewayId: { type: String, required: true }
  },
  deletedBy: { type: String, default: "ADMIN" },
  originalCreatedAt: { type: Date }
}, { timestamps: true });

const DeletedCollector = backupConnection.model('DeletedCollector', deletedCollectorSchema);
export default DeletedCollector;
