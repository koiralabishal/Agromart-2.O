import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
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
      ], // Aligning with frontend options
    },
    productImage: {
      type: String, // URL or reference
    },
    availableStatus: {
      type: String,
      default: "Available",
      enum: ["Available", "Out of Stock"],
    },
  },
  {
    timestamps: true,
    // Ensure the fields are saved in the preferred order (conceptually)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Business Rule: Automatically update availableStatus based on quantity
productSchema.pre("save", function () {
  if (this.quantity === 0) {
    this.availableStatus = "Out of Stock";
  } else {
    this.availableStatus = "Available";
  }
});

export { productSchema };
const Product = mongoose.model("Product", productSchema);
export default Product;
