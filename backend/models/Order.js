import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderID: {
      type: String,
      required: true,
      unique: true,
    },
    buyerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productID: {
          type: String, // Can be ObjectId or string ID depending on source
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        unit: String,
        image: String,
        category: String,
        productDescription: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryCharge: {
      type: Number,
      default: 100, // Rs. 100 per order
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Processing",
        "Shipping",
        "Delivered",
        "Canceled",
        "Rejected",
      ],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["eSewa", "COD", "Khalti"],
      required: true,
    },
    transactionUUID: {
      type: String, // Shared ID for all orders in a single checkout
      required: true,
    },
    transactionCode: {
      type: String, // eSewa transaction code
    },
    isStocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate orders for same transaction + seller
// This is the DATABASE-LEVEL protection against race conditions
orderSchema.index({ transactionUUID: 1, sellerID: 1 }, { unique: true });

export default mongoose.model("Order", orderSchema);
