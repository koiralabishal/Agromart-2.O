import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
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
  }
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;
