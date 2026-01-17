import mongoose from 'mongoose';
import { backupConnection } from "../config/db.js";

const deletedBuyerSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  companyName: { type: String }, 
  deliveryAddress: { type: String, required: true },
  paymentDetails: {
    method: { type: String, required: true },
    gatewayId: { type: String, required: true }
  },
  deletedBy: { type: String, default: "ADMIN" },
  originalCreatedAt: { type: Date }
}, { timestamps: true });

const DeletedBuyer = backupConnection.model('DeletedBuyer', deletedBuyerSchema);
export default DeletedBuyer;
