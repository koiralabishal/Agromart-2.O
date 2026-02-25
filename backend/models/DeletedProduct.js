import mongoose from "mongoose";
import { productSchema } from "./Product.js";
import { backupConnection } from "../config/db.js";

// Shallow copy the schema to avoid modifying the original
const deletedProductSchema = productSchema.clone();

// Add backup-specific fields
deletedProductSchema.add({
  deletedBy: { type: String },
  originalCreatedAt: { type: Date }
});

const DeletedProduct = backupConnection.model("DeletedProduct", deletedProductSchema);

export default DeletedProduct;
