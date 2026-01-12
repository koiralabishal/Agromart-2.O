import express from "express";
import {
  getActiveDistributors,
  getActiveFarmers,
  getActiveCollectors,
  updateUserProfile,
} from "../controllers/userController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.get("/active-farmers", getActiveFarmers);
router.get("/active-collectors", getActiveCollectors);
router.get("/active-distributors", getActiveDistributors);
router.get("/profile/:userID", async (req, res) => {
  try {
    const user = await User.findById(req.params.userID);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
router.put("/profile", upload.single("profileImage"), updateUserProfile);

export default router;
