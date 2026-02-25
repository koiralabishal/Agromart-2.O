import mongoose from 'mongoose';
import { backupConnection } from '../config/db.js';

const deletedTransactionSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['Credit', 'Debit'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['eSewa', 'COD', 'Khalti', 'Bank Transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Locked', 'Verified', 'Rejected'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  orderID: {
    type: String
  },
  deletedBy: { type: String, default: "ADMIN" },
  originalCreatedAt: { type: Date }
}, { timestamps: true });

const DeletedTransaction = backupConnection.model('DeletedTransaction', deletedTransactionSchema);
export default DeletedTransaction;
