import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Verified', 'Completed', 'Rejected', 'Approved'], 
    default: 'Pending' 
  },
  paymentMethod: {
    type: String,
    enum: ['eSewa', 'esewa', 'Khalti', 'khalti', 'Bank Transfer', 'bank transfer'],
    required: true
  },
  accountDetails: {
    type: String, // e.g., eSewa ID or Bank Account Number
    required: true
  },
  processedAt: {
    type: Date
  },
  remarks: {
    type: String
  }
}, { timestamps: true });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
