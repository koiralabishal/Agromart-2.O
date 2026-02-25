import mongoose from "mongoose";

const deletedUserSchema = new mongoose.Schema(
  {
    originalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    role: { type: String },
    profileImage: { type: String },
    status: { type: String },
    docStatus: { type: String },
    deletedBy: {
      type: String,
    },
    reason: { type: String },
    originalCreatedAt: { type: Date },
  },
  { timestamps: true }
);

import { backupConnection } from "../config/db.js";

const DeletedUser = backupConnection.model("DeletedUser", deletedUserSchema);
export default DeletedUser;
