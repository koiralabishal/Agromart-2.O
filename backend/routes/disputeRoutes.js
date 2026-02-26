import express from "express";
import { 
  createDispute, 
  getMyDisputes, 
  getDisputeById 
} from "../controllers/disputeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.post("/", upload.array("evidenceDocuments", 5), createDispute);
router.get("/my", getMyDisputes);
router.get("/:id", getDisputeById);

export default router;
