import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaBox,
  FaSearch,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import api from "../../../api/axiosConfig";
import "./Styles/InventoryManagement.css";

const InventoryManagement = ({ onAddInventory, initialData, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryItems, setInventoryItems] = useState(() => {
    // Priority: initialData > cache > empty array
    if (initialData && initialData.length > 0) return initialData;
    const cached = localStorage.getItem("supplierInventory_cache");
    return cached ? JSON.parse(cached) : [];
  });

  const [expandedItems, setExpandedItems] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleDescription = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory?userID=${user._id || user.id}`);
      setInventoryItems(res.data);
      localStorage.setItem("supplierInventory_cache", JSON.stringify(res.data));
      if (onRefresh) onRefresh(); // Sync back to parent if needed
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Keep state in sync with initialData from parent pre-fetch
  useEffect(() => {
    if (initialData) {
      setInventoryItems(initialData);
    }
  }, [initialData]);

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      const itemId = itemToDelete._id || itemToDelete.id;
      await api.delete(`/inventory/${itemId}`);
      
      // Success: Optimistic update
      setInventoryItems((prev) => prev.filter((item) => (item._id || item.id) !== itemId));
      
      // Update cache
      const updatedCache = inventoryItems.filter((item) => (item._id || item.id) !== itemId);
      localStorage.setItem("supplierInventory_cache", JSON.stringify(updatedCache));
      
      setShowDeleteModal(false);
      setItemToDelete(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = inventoryItems.filter((item) =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inventory-management">
      <div className="im-header">
        <h2>Inventory Management</h2>
        <div className="im-header-actions">
          <div className="search-bar-container">
            <FaSearch style={{ color: "grey" }} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-inventory-btn" onClick={onAddInventory}>
            <FaPlus /> Add to Inventory
          </button>
        </div>
      </div>

      <div className="inventory-grid">
        {loading && inventoryItems.length === 0 ? (
          <div className="im-empty-state">Loading inventory...</div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item._id || item.id} className="inventory-card">
              <img
                src={item.productImage || "https://via.placeholder.com/300x200?text=No+Image"}
                alt={item.productName}
                className="inventory-image"
              />
              <div className="inventory-info">
                <div className="inventory-info-header">
                  <div className="inventory-name-area">
                    <h3>{item.productName}</h3>
                    <p className="inventory-category">{item.category}</p>
                  </div>
                  <div className="inventory-actions">
                    <button className="im-action-btn edit-btn" title="Edit">
                      <FaEdit />
                    </button>
                    <button
                      className="im-action-btn delete-btn"
                      title="Delete"
                      onClick={() => confirmDelete(item)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>

                <div className="item-description-container">
                  <p
                    className={`item-description ${
                      expandedItems[item._id || item.id] ? "expanded" : ""
                    }`}
                  >
                    {item.productDescription}
                  </p>
                  {item.productDescription &&
                    item.productDescription.split(/\s+/).length > 20 && (
                      <button
                        className="description-toggle-btn"
                        onClick={() => toggleDescription(item._id || item.id)}
                        title={
                          expandedItems[item._id || item.id] ? "Show Less" : "Show More"
                        }
                      >
                        {expandedItems[item._id || item.id] ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                    )}
                </div>

                <div className="inventory-details">
                  <span className="price-tag">
                    Rs. {item.price}/{item.unit}
                  </span>
                  <div className="qty-wrapper">
                    <FaBox className="im-detail-icon" />
                    <span>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <span
                    className={`im-status-tag ${
                      item.availableStatus === "Available"
                        ? "status-available"
                        : "status-out-of-stock"
                    }`}
                  >
                    {item.availableStatus}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="im-empty">
            <FaBox className="empty-icon" />
            <p>
              Your inventory is empty! Start adding stock items to manage your
              supply warehouse.
            </p>
            <button onClick={onAddInventory} className="im-empty-add-btn">
              <FaPlus /> Add Your First Item
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-icon">
              <FaExclamationTriangle />
            </div>
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{itemToDelete?.productName}</strong>? This action is
              irreversible.
            </p>
            <div className="delete-modal-actions">
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm-delete-btn"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
