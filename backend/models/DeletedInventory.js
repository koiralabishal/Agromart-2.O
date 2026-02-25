import mongoose from "mongoose";
import { inventorySchema } from "./Inventory.js";
import { backupConnection } from "../config/db.js";

// Shallow copy the schema to avoid modifying the original
const deletedInventorySchema = inventorySchema.clone();

// Add backup-specific fields
deletedInventorySchema.add({
  deletedBy: { type: String },
  originalCreatedAt: { type: Date }
});

const DeletedInventory = backupConnection.model("DeletedInventory", deletedInventorySchema);

export default DeletedInventory;
