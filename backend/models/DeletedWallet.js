import mongoose from 'mongoose';
import { backupConnection } from '../config/db.js';

const deletedWalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availableBalance: {
    type: Number,
    default: 0
  },
  lockedBalance: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  isFrozen: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
  deletedBy: { type: String, default: "ADMIN" },
  originalCreatedAt: { type: Date }
}, { timestamps: true });

const DeletedWallet = backupConnection.model('DeletedWallet', deletedWalletSchema);
export default DeletedWallet;
