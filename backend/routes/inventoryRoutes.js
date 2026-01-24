import express from "express";
import {
  createInventory,
  getInventory,
  deleteInventory,
  updateInventoryQuantity,
  updateInventory,
  stockOrderItems,
} from "../controllers/inventoryController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/", upload.single("productImage"), createInventory);
router.get("/", getInventory);
router.delete("/:id", deleteInventory);
router.patch("/:id/quantity", updateInventoryQuantity);
router.put("/:id", upload.single("productImage"), updateInventory);
router.post("/stock-order", stockOrderItems);

export default router;
