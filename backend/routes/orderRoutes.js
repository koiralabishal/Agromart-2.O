import express from "express";
import {
  initiatePayment,
  createOrder,
  getOrders,
  verifyPayment,
  updateOrderStatus,
  confirmCODPayment,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/initiate", initiatePayment);
router.post("/create", createOrder); // For COD and manual creation
router.get("/", getOrders);
router.post("/verify-payment", verifyPayment);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/confirm-payment", confirmCODPayment);

export default router;
