import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    lockedBalance: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    isFrozen: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
  },
  { timestamps: true },
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
