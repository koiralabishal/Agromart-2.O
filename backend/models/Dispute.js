import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    orderID: {
      type: String, // AGRM-XXXX
      required: true,
    },
    transactionUUID: {
      type: String, // Link to payment
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "Product Not Received",
        "Damaged Product",
        "Wrong Item",
        "Payment Issue",
        "Other",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Rejected"],
      default: "Open",
    },
    resolution: {
      action: {
        type: String,
        enum: ["Refund", "Replacement", "Dismissed", "None"],
      },
      adminComments: String,
      refundAmount: Number,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Admin
      },
      resolvedAt: Date,
    },
    evidenceImages: [String], // URLs
  },
  { timestamps: true }
);

const Dispute = mongoose.model("Dispute", disputeSchema);
export default Dispute;
