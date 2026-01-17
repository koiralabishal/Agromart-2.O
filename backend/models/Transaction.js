import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    sellerId: {
      // Who receives the payment (farmer, collector, or supplier)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      // Who makes the payment (collector, supplier, or buyer)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for withdrawal transactions
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["Credit", "Debit"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["eSewa", "COD", "Khalti", "Bank Transfer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Locked", "Verified", "Rejected"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    orderID: {
      // For easy lookup like "AGRM-1234"
      type: String,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
