import express from "express";
import {
  getActiveFarmers,
  getActiveCollectors,
  getActiveDistributors,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/active-farmers", getActiveFarmers);
router.get("/active-collectors", getActiveCollectors);
router.get("/active-distributors", getActiveDistributors);

export default router;
