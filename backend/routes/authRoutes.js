import express from 'express';
import { registerUser, loginUser, sendOTP, logoutUser } from '../controllers/authController.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// 'license' should match the field name in the frontend FormData
router.post('/register', upload.single('license'), registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/send-otp', sendOTP);

export default router;
