import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  companyName: { type: String }, // Optional for buyers
  deliveryAddress: { type: String, required: true },
  paymentDetails: {
    method: { type: String, required: true },
    gatewayId: { type: String, required: true }
  }
}, { timestamps: true });

const Buyer = mongoose.model('Buyer', buyerSchema);
export default Buyer;
