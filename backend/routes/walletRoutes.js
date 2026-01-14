import express from "express";
import {
  getWalletData,
  requestWithdrawal,
  getPaymentDetails,
} from "../controllers/walletController.js";

const router = express.Router();

router.get("/:userId", getWalletData);
router.get("/payment-details/:userId", getPaymentDetails);
router.post("/withdraw", requestWithdrawal);

export default router;
