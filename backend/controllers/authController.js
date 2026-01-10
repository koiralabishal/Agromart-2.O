import User from '../models/User.js';
import Farmer from '../models/Farmer.js';
import Collector from '../models/Collector.js';
import Supplier from '../models/Supplier.js';
import Buyer from '../models/Buyer.js';
import OTP from '../models/OTP.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  try {
    const { 
      name, email, phone, address, password, role, otp,
      // Role specific fields
      farmName, farmRegistrationNumber,
      companyName, businessRegistrationNumber, location,
      deliveryAddress,
      paymentMethod, gatewayId
    } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get license URL from cloudinary (multer storage)
    const licenseUrl = req.file ? req.file.path : null;

    // Create Base User
    const user = await User.create({
      name, email, phone, address, password, role
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    // Create Role Specific Data
    let roleData;
    const commonRoleProps = {
      userId: user._id,
      paymentDetails: { method: paymentMethod, gatewayId }
    };

    switch (role) {
      case 'farmer':
        roleData = await Farmer.create({
          ...commonRoleProps,
          farmName,
          farmRegistrationNumber,
          licenseUrl
        });
        break;
      case 'collector':
        roleData = await Collector.create({
          ...commonRoleProps,
          companyName,
          location,
          licenseUrl
        });
        break;
      case 'supplier':
        roleData = await Supplier.create({
          ...commonRoleProps,
          companyName,
          businessRegistrationNumber,
          location,
          licenseUrl
        });
        break;
      case 'buyer':
        roleData = await Buyer.create({
          ...commonRoleProps,
          companyName,
          deliveryAddress
        });
        break;
      default:
        // If role is invalid, we should probably delete the User created above
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Invalid role' });
    }

    // Delete OTP after successful registration
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for Admin Login (Environment Variables)
    console.log("Login Attempt:", email);
    console.log("Env Email:", process.env.ADMIN_EMAIL);
    console.log("Env Pass Match:", password === process.env.ADMIN_PASSWORD);
    
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return res.json({
        _id: 'admin-id',
        name: 'Admin',
        email: email,
        role: 'admin',
        token: generateToken('admin-id')
      });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (replaces existing OTP for this email)
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send Email with HTML Template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
        .header { background-color: #2e8b57; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px; color: #333; line-height: 1.6; }
        .otp-code { background-color: #f4fbf7; border: 2px dashed #2e8b57; border-radius: 8px; color: #2e8b57; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 30px 0; padding: 20px; text-align: center; }
        .footer { background-color: #f9f9f9; color: #777; font-size: 12px; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌿 AgroMart</div>
          <div style="font-size: 16px; opacity: 0.9;">Cultivating Trust, Connecting Growth</div>
        </div>
        <div class="content">
          <h2 style="margin-top: 0; color: #2c3e50;">Verify Your Email Address</h2>
          <p>Hello,</p>
          <p>Thank you for joining Agromart! To complete your registration and secure your account, please use the following verification code:</p>
          <div class="otp-code">${otp}</div>
          <p>This code is valid for <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>The AgroMart Team</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} AgroMart. All rights reserved.<br>
          Empowering farmers, suppliers, and buyers worldwide.
        </div>
      </div>
    </body>
    </html>
    `;

    const emailSent = await sendEmail(
      email,
      'Agromart - Your Verification Code',
      `Your verification code is: ${otp}`,
      htmlTemplate
    );

    if (emailSent) {
      res.json({ message: 'OTP sent successfully to your email' });
    } else {
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
