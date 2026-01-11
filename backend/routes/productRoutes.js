import express from "express";
import {
  createProduct,
  getProducts,
  deleteProduct,
  updateProductQuantity,
} from "../controllers/productController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Route for creating a product (handling optional image upload)
router.post("/", upload.single("productImage"), createProduct);
router.get("/", getProducts);
router.delete("/:id", deleteProduct);
router.patch("/:id/quantity", updateProductQuantity);

export default router;
