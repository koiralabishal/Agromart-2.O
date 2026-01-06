import mongoose from 'mongoose';

const collectorSchema = new mongoose.Schema({
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
  }
}, { timestamps: true });

const Collector = mongoose.model('Collector', collectorSchema);
export default Collector;
