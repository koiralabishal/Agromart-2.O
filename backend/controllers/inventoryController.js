import Inventory from "../models/Inventory.js";
import User from "../models/User.js";
import DeletedInventory from "../models/DeletedInventory.js";

// @desc    Create a new inventory item
// @route   POST /api/inventory
// @access  Private (Collector)
export const createInventory = async (req, res) => {
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
        const userDetails = await User.findById(userID);
        if (userDetails) {
          const rolePrefix =
            userDetails.role.charAt(0).toUpperCase() +
            userDetails.role.slice(1);
          console.log(
            `>>> Inventory being added by ${rolePrefix}: ${userDetails.name} (${userDetails.email})`
          );
        }
      } catch (err) {
        console.error("Error fetching user details for log:", err.message);
      }
    }

    const image = req.file ? req.file.path : req.body.productImage;

    const inventory = new Inventory({
      productName,
      quantity: Number(quantity),
      unit,
      price: Number(price),
      productDescription,
      userID,
      category,
      productImage: image,
    });

    const createdInventory = await inventory.save();
    console.log(
      ">>> Inventory item created successfully:",
      createdInventory.productName
    );
    res.status(201).json(createdInventory);
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all inventory items for a specific collector
// @route   GET /api/inventory
// @access  Private
export const getInventory = async (req, res) => {
  try {
    const { userID } = req.query;
    let query = {};

    if (userID) {
      query.userID = userID;
    }

    const inventory = await Inventory.find(query)
      .sort({ createdAt: -1 })
      .populate("userID", "name email");

    res.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an inventory item with backup
// @route   DELETE /api/inventory/:id
// @access  Private (Collector)
export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    console.log(
      `>>> Archiving and deleting inventory item: ${item.productName} (ID: ${id})`
    );

    const itemData = item.toObject();
    delete itemData._id;

    const archivedItem = new DeletedInventory(itemData);
    await archivedItem.save();
    console.log(
      `>>> Inventory item backed up successfully to backup_agromart_2`
    );

    await Inventory.findByIdAndDelete(id);
    console.log(`>>> Inventory item removed from main database`);

    res.json({ message: "Inventory item deleted and backed up successfully" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory quantity
// @route   PATCH /api/inventory/:id/quantity
// @access  Private
export const updateInventoryQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body; // positive to increase, negative to decrease

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const newQuantity = item.quantity + delta;
    if (newQuantity < 0) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    item.quantity = newQuantity;
    await item.save();

    console.log(
      `>>> Inventory ${item.productName} quantity updated by ${delta}. New quantity: ${item.quantity}`
    );
    res.json(item);
  } catch (error) {
    console.error("Error updating inventory quantity:", error);
    res.status(500).json({ message: error.message });
  }
};
