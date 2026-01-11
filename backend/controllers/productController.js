import Product from "../models/Product.js";
import User from "../models/User.js";
import DeletedProduct from "../models/DeletedProduct.js";

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Farmer)
export const createProduct = async (req, res) => {
  console.log("Create Product Request - Body:", req.body);
  console.log("Create Product Request - File:", req.file);
  try {
    const {
      productName,
      quantity,
      unit,
      price,
      productDescription,
      userID,
      category,
    } = req.body;

    // Log User Details
    if (userID) {
      try {
        const farmer = await User.findById(userID);
        if (farmer) {
          console.log(
            `>>> Product being added by Farmer: ${farmer.name} (${farmer.email})`
          );
        } else {
          console.log(">>> Farmer not found for userID:", userID);
        }
      } catch (err) {
        console.error("Error fetching farmer details for log:", err.message);
      }
    }

    // Handle image from Cloudinary (req.file) or as a fallback
    const image = req.file ? req.file.path : req.body.productImage;

    const product = new Product({
      productName,
      quantity: Number(quantity),
      unit,
      price: Number(price),
      productDescription,
      userID,
      category,
      productImage: image,
    });

    const createdProduct = await product.save();
    console.log(
      ">>> Product created successfully:",
      createdProduct.productName
    );
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all products or products for a specific user
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const { userID } = req.query;
    let query = {};

    if (userID) {
      query.userID = userID;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 }) // Sort by latest first
      .populate("userID", "name email");

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product with backup
// @route   DELETE /api/products/:id
// @access  Private (Farmer)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find product in main DB
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(
      `>>> Archiving and deleting product: ${product.productName} (ID: ${id})`
    );

    // 2. Create backup in backup_agromart_2
    const productData = product.toObject();
    delete productData._id; // Let backup DB generate its own ID

    const archivedProduct = new DeletedProduct(productData);
    await archivedProduct.save();
    console.log(`>>> Product backed up successfully to backup_agromart_2`);

    // 3. Delete from main DB
    await Product.findByIdAndDelete(id);
    console.log(`>>> Product removed from main database`);

    res.json({ message: "Product deleted and backed up successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message });
  }
};
