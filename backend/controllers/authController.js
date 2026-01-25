import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
import Collector from "../models/Collector.js";
import Supplier from "../models/Supplier.js";
import Buyer from "../models/Buyer.js";
import OTP from "../models/OTP.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/emailService.js";
import { broadcast } from "../socket.js";
import { logActivity } from "../utils/activityLogger.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      password,
      role,
      otp,
      // Role specific fields
      farmName,
      farmRegistrationNumber,
      companyName,
      businessRegistrationNumber,
      location,
      deliveryAddress,
      paymentMethod,
      gatewayId,
    } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Get license URL from cloudinary (multer storage)
    const licenseUrl = req.file ? req.file.path : null;

    // Create Base User
    const user = await User.create({
      name,
      email,
      phone,
      address,
      password,
      role,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    // Create Role Specific Data
    let roleData;
    const commonRoleProps = {
      userId: user._id,
      paymentDetails: { method: paymentMethod, gatewayId },
    };

    switch (role) {
      case "farmer":
        roleData = await Farmer.create({
          ...commonRoleProps,
          farmName,
          farmRegistrationNumber,
          licenseUrl,
        });
        break;
      case "collector":
        roleData = await Collector.create({
          ...commonRoleProps,
          companyName,
          location,
          licenseUrl,
        });
        break;
      case "supplier":
        roleData = await Supplier.create({
          ...commonRoleProps,
          companyName,
          businessRegistrationNumber,
          location,
          licenseUrl,
        });
        break;
      case "buyer":
        roleData = await Buyer.create({
          ...commonRoleProps,
          companyName,
          deliveryAddress,
        });
        break;
      default:
        // If role is invalid, we should probably delete the User created above
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: "Invalid role" });
    }

    // Delete OTP after successful registration
    await OTP.deleteOne({ _id: otpRecord._id });

    // Notify Admin of new registration
    broadcast("dashboard:update", { type: "USER_REGISTERED", user });

    // Log Activity
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
    await logActivity({
      type: "USER_REGISTER",
      message: `New ${roleLabel} Registered`,
      detail: `${name} has joined the platform`,
      userId: user._id, 
      metadata: { role, email }
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user in database (including admin)
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (replaces existing OTP for this email)
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true },
    );

    const emailSent = await sendOTPEmail(email, otp);

    if (emailSent) {
      res.json({ message: "OTP sent successfully to your email" });
    } else {
      res.status(500).json({ message: "Failed to send verification email" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
