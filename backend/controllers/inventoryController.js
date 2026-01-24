import Inventory from "../models/Inventory.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import DeletedInventory from "../models/DeletedInventory.js";
import { emitToUser, emitToRole } from "../socket.js";
import { logActivity } from "../utils/activityLogger.js";

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
            `>>> Inventory being added by ${rolePrefix}: ${userDetails.name} (${userDetails.email})`,
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
      createdInventory.productName,
    );

    // Get user details for activity log and notifications
    const userDetails = await User.findById(userID);
    const roleLabel = userDetails?.role?.charAt(0).toUpperCase() + userDetails?.role?.slice(1) || "User";

    // Log activity
    await logActivity({
      type: "INVENTORY_CREATED",
      message: `Inventory "${createdInventory.productName}" Added`,
      detail: `Added by ${userDetails?.name || roleLabel}`,
      userId: userID,
      metadata: { inventoryId: createdInventory._id, productName: createdInventory.productName },
    });

    // Notify User's own Dashboard
    emitToUser(userID, "dashboard:update", {
      type: "INVENTORY_CREATED",
      inventory: createdInventory,
    });

    // Notify the next level in the supply chain
    if (userDetails?.role === "collector") {
      emitToRole("supplier", "dashboard:update", {
        type: "INVENTORY_CREATED",
        inventory: createdInventory,
      });
    } else if (userDetails?.role === "supplier") {
      emitToRole("buyer", "dashboard:update", {
        type: "INVENTORY_CREATED",
        inventory: createdInventory,
      });
    }
    // Notify Admin Dashboard for real-time stats update
    emitToRole("admin", "dashboard:update", {
      type: "INVENTORY_CREATED",
      inventory: createdInventory,
    });

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
      `>>> Archiving and deleting inventory item: ${item.productName} (ID: ${id})`,
    );

    const itemData = item.toObject();
    delete itemData._id;

    const archivedItem = new DeletedInventory(itemData);
    await archivedItem.save();
    console.log(
      `>>> Inventory item backed up successfully to backup_agromart_2`,
    );

    await Inventory.findByIdAndDelete(id);
    console.log(`>>> Inventory item removed from main database`);

    // Get user details for activity log
    const userDetails = await User.findById(item.userID);
    const roleLabel = userDetails?.role?.charAt(0).toUpperCase() + userDetails?.role?.slice(1) || "User";

    // Log activity
    await logActivity({
      type: "INVENTORY_DELETED",
      message: `Inventory "${item.productName}" Deleted`,
      detail: `Deleted by ${userDetails?.name || roleLabel}`,
      userId: item.userID,
      metadata: { inventoryId: id, productName: item.productName },
    });

    // Notify User
    emitToUser(item.userID, "dashboard:update", {
      type: "INVENTORY_DELETED",
      inventoryId: id,
    });

    // Notify next level
    if (userDetails?.role === "collector") {
      emitToRole("supplier", "dashboard:update", {
        type: "INVENTORY_DELETED",
        inventoryId: id,
      });
    } else if (userDetails?.role === "supplier") {
      emitToRole("buyer", "dashboard:update", {
        type: "INVENTORY_DELETED",
        inventoryId: id,
      });
    }
    // Notify Admin Dashboard for real-time stats update
    emitToRole("admin", "dashboard:update", {
      type: "INVENTORY_DELETED",
      inventoryId: id,
    });

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
      `>>> Inventory ${item.productName} quantity updated by ${delta}. New quantity: ${item.quantity}`,
    );

    // Notify Collector Dashboard
    emitToUser(item.userID, "dashboard:update", {
      type: "INVENTORY_QUANTITY_UPDATED",
      inventory: item,
    });

    // Notify the next level in the supply chain
    const userDetails = await User.findById(item.userID);
    if (userDetails?.role === "collector") {
      emitToRole("supplier", "dashboard:update", {
        type: "INVENTORY_QUANTITY_UPDATED",
        inventory: item,
      });
    } else if (userDetails?.role === "supplier") {
      emitToRole("buyer", "dashboard:update", {
        type: "INVENTORY_QUANTITY_UPDATED",
        inventory: item,
      });
    }

    res.json(item);
  } catch (error) {
    console.error("Error updating inventory quantity:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Collector/Supplier)
export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, quantity, unit, price, productDescription, category } =
      req.body;

    const inventory = await Inventory.findById(id);

    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Update fields if provided
    if (productName) inventory.productName = productName;
    if (quantity !== undefined) inventory.quantity = Number(quantity);
    if (unit) inventory.unit = unit;
    if (price !== undefined) inventory.price = Number(price);
    if (productDescription) inventory.productDescription = productDescription;
    if (category) inventory.category = category;

    // Handle image update if a new file is uploaded
    if (req.file) {
      inventory.productImage = req.file.path;
    } else if (req.body.productImage) {
      inventory.productImage = req.body.productImage;
    }

    const updatedInventory = await inventory.save();
    console.log(
      `>>> Inventory updated successfully: ${updatedInventory.productName}`,
    );

    // Notify User
    emitToUser(updatedInventory.userID, "dashboard:update", {
      type: "INVENTORY_UPDATED",
      inventory: updatedInventory,
    });

    // Notify next level
    const userDetails = await User.findById(updatedInventory.userID);
    if (userDetails?.role === "collector") {
      emitToRole("supplier", "dashboard:update", {
        type: "INVENTORY_UPDATED",
        inventory: updatedInventory,
      });
    } else if (userDetails?.role === "supplier") {
      emitToRole("buyer", "dashboard:update", {
        type: "INVENTORY_UPDATED",
        inventory: updatedInventory,
      });
    }

    // Log user activity
    await logActivity({
      type: "INVENTORY_UPDATED",
      message: `Inventory "${updatedInventory.productName}" Updated`,
      detail: `Updated by ${userDetails?.name || 'User'}`,
      userId: updatedInventory.userID,
      metadata: { inventoryId: updatedInventory._id, productName: updatedInventory.productName }
    });

    res.json(updatedInventory);
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Stock order items into inventory
// @route   POST /api/inventory/stock-order
// @access  Private
export const stockOrderItems = async (req, res) => {
  try {
    const { orderId, items } = req.body;
    const userID = req.user?._id || req.body.userID;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isStocked) {
      return res.status(400).json({ message: "Order already added to inventory" });
    }

    const stockedItemsNames = [];

    for (const item of items) {
      // Find existing item with same name for this user
      let inventoryItem = await Inventory.findOne({
        userID: userID,
        productName: item.productName,
      });

      if (inventoryItem) {
        // Update existing
        inventoryItem.quantity += Number(item.quantity);
        inventoryItem.price = Number(item.sellingPrice);
        // Sync other details if they changed? User said same as order items but price different.
        await inventoryItem.save();
      } else {
        // Create new
        const orderProduct = order.products.find(p => p.productName === item.productName);
        
        // Fetch the original product/inventory to get the actual description
        let productDescription = `From Order ${order.orderID}`; // Fallback
        if (orderProduct?.productID) {
          try {
            // 1. Try fetching from Product collection (Farmer sales)
            let originalSource = await Product.findById(orderProduct.productID);
            
            // 2. If not found, try fetching from Inventory collection (Collector sales)
            if (!originalSource) {
              originalSource = await Inventory.findById(orderProduct.productID);
            }

            if (originalSource?.productDescription) {
              productDescription = originalSource.productDescription;
            }
          } catch (err) {
            console.warn(`Could not fetch original source ${orderProduct.productID}:`, err.message);
          }
        }
        
        inventoryItem = new Inventory({
          userID: userID,
          productName: item.productName,
          quantity: Number(item.quantity),
          unit: item.unit || orderProduct?.unit,
          price: Number(item.sellingPrice),
          productDescription: productDescription,
          category: item.category || orderProduct?.category,
          productImage: orderProduct?.image || "",
          availableStatus: "Available"
        });
        await inventoryItem.save();
      }
      stockedItemsNames.push(item.productName);
    }

    // Update order status
    order.isStocked = true;
    await order.save();

    // Notify User
    emitToUser(userID, "dashboard:update", {
      type: "INVENTORY_STOCKED_FROM_ORDER",
      orderId: order.orderID,
    });

    // Log Activity (This also emits to Admin Dashboard via ACTIVITY_LOGGED)
    await logActivity({
      type: "INVENTORY_STOCKED",
      message: `Stocked items from Order #${order.orderID}`,
      detail: `${stockedItemsNames.length} items added/updated.`,
      userId: userID,
      metadata: { orderId: order._id, items: stockedItemsNames }
    });

    res.json({ message: "Items added to inventory successfully", stockedItemsNames });
  } catch (error) {
    console.error("Error stocking order items:", error);
    res.status(500).json({ message: error.message });
  }
};
