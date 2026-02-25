import mongoose from "mongoose";
import { backupConnection } from "../config/db.js";

const deletedActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    deletedBy: {
      type: String,
    },
    originalCreatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const DeletedActivity = backupConnection.model("DeletedActivity", deletedActivitySchema);

export default DeletedActivity;
