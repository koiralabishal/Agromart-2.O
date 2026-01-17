import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Debug: Check if MONGODB_URI is loaded
console.log('MONGODB_URI loaded:', process.env.MONGODB_URI ? 'Yes' : 'No');
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.error('Expected .env location:', envPath);
  process.exit(1);
}

const createAdmin = async () => {
  try {
    // Connect to database FIRST
    const connectDB = async () => {
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    };
    
    // Call the connection function
    await connectDB();
    
    console.log('🔍 Checking for existing admin...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@agromart.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }
    
    // Create admin user
    const adminData = {
      name: 'Agromart Admin',
      email: 'admin@agromart.com',
      password: 'Admin@123', // Will be hashed by the User model pre-save hook
      phone: '9800000000',
      address: 'Kathmandu, Nepal',
      role: 'admin',
      status: 'active',
      docStatus: 'verified'
    };
    
    const admin = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Name:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: Admin@123');
    console.log('🎭 Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ You can now login with these credentials');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
