import mongoose from "mongoose";

const deletedOrderSchema = new mongoose.Schema(
  {
    originalOrderId: { type: String },
    orderID: { type: String },
    buyerID: { type: mongoose.Schema.Types.ObjectId },
    sellerID: { type: mongoose.Schema.Types.ObjectId },
    products: [
      {
        productID: String,
        productName: String,
        quantity: Number,
        price: Number,
        unit: String,
        image: String,
        category: String,
        productDescription: String,
      },
    ],
    totalAmount: Number,
    deliveryCharge: Number,
    status: String,
    paymentStatus: String,
    paymentMethod: String,
    transactionUUID: String,
    transactionCode: String,
    isStocked: Boolean,
    deletedBy: {
      type: String,
    },
    reason: { type: String },
    originalCreatedAt: { type: Date },
  },
  { timestamps: true },
);

import { backupConnection } from "../config/db.js";

const DeletedOrder = backupConnection.model("DeletedOrder", deletedOrderSchema);
export default DeletedOrder;
