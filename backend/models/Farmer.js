import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  farmName: { type: String, required: true },
  farmRegistrationNumber: { type: String, required: true },
  licenseUrl: { type: String }, // Cloudinary URL
  paymentDetails: {
    method: { type: String, required: true },
    gatewayId: { type: String, required: true }
  }
}, { timestamps: true });

const Farmer = mongoose.model('Farmer', farmerSchema);
export default Farmer;
