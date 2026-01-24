import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        // User Activities
        "USER_REGISTER",
        "USER_DELETE",
        "USER_VERIFY",
        "USER_REJECT",
        "USER_UPDATE",

        // Product Activities
        "PRODUCT_CREATED",
        "PRODUCT_UPDATED",
        "PRODUCT_DELETED",

        // Inventory Activities
        "INVENTORY_CREATED",
        "INVENTORY_UPDATED",
        "INVENTORY_DELETED",
        "INVENTORY_STOCKED",

        // Order Activities
        "ORDER_UPDATED",
        "ORDER_PLACED",
        "ORDER_ACCEPTED",
        "ORDER_PROCESSING",
        "ORDER_SHIPPED",
        "ORDER_DELIVERED",
        "ORDER_REJECTED",
        "ORDER_CANCELLED",

        // Wallet Activities
        "WALLET_FROZEN",
        "WALLET_ACTIVATED",
        "WITHDRAWAL_REQUEST",
        "WITHDRAWAL_VERIFIED",
        "WITHDRAWAL_REJECTED",
        "WITHDRAWAL_COMPLETED",

        // COD Activities
        "COD_SETTLEMENT_PENDING",
        "COD_SETTLEMENT_COMPLETED",

        // Dispute Activities
        "DISPUTE_RAISED",
        "DISPUTE_RESOLVED",
        "DISPUTE_REFUNDED",
        "DISPUTE_DISMISSED",

        // Admin Activities
        "ADMIN_ACTION",
      ],
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
      ref: "User",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // For storing additional data
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
activitySchema.index({ createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
