import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Vegetables",
        "Fruits",
        "Grains",
        "Dairy",
        "Vegetable",
        "Fruit",
        "Other",
      ],
    },
    productImage: {
      type: String,
    },
    availableStatus: {
      type: String,
      default: "Available",
      enum: ["Available", "Out of Stock"],
    },
    lowStockThreshold: {
      type: Number,
      default: 20,
    },
    lowStockNotified: {
      type: Boolean,
      default: false,
    },
    outOfStockNotified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Business Rule: Automatically update availableStatus and reset notification flags
inventorySchema.pre("save", function () {
  if (this.quantity === 0) {
    this.availableStatus = "Out of Stock";
  } else {
    this.availableStatus = "Available";
  }

  // If quantity is above threshold, reset notification flags for future alerts
  if (this.quantity > this.lowStockThreshold) {
    this.lowStockNotified = false;
  }
  if (this.quantity > 0) {
    this.outOfStockNotified = false;
  }
});

export { inventorySchema };
const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
