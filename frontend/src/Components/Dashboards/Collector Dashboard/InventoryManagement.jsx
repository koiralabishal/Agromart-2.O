import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaBox,
  FaSearch,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import api from "../../../api/axiosConfig";
import "./Styles/InventoryManagement.css"

const InventoryManagement = ({ onAddInventory }) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Immediate data: Use local storage cache for the collector's inventory
  const [inventory, setInventory] = useState(() => {
    const cached = localStorage.getItem("cached_inventory");
    return cached ? JSON.parse(cached) : null;
  });
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleDescription = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user?._id || user?.id;

  const fetchInventory = async () => {
    try {
      const response = await api.get(`/inventory?userID=${userID}`);
      setInventory(response.data);
      // Cache the inventory data
      localStorage.setItem("cached_inventory", JSON.stringify(response.data));
      setError(null);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch inventory");
      setInventory((prev) => prev || []); // Fallback to empty if no cache
    }
  };

  useEffect(() => {
    if (userID) {
      fetchInventory();
    }
  }, [userID]);

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      await api.delete(`/inventory/${itemToDelete._id}`);

      // Success
      setShowDeleteModal(false);
      setItemToDelete(null);
      fetchInventory(); // Refresh list
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      alert("Error deleting item: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredInventory = (inventory || []).filter((item) =>
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

      {inventory === null ? (
        <div className="im-empty">
          {/* Subtle placeholder while fetching */}
        </div>
      ) : inventory.length === 0 ? (
        <div className="im-empty">
          <FaBox className="empty-icon" />
          <p>
            Your inventory is empty! Start adding stock items to manage your
            collection center.
          </p>
          <button onClick={onAddInventory} className="im-empty-add-btn">
            <FaPlus /> Add Your First Item
          </button>
        </div>
      ) : (
        <div className="inventory-grid">
          {filteredInventory.map((item) => (
            <div key={item._id} className="inventory-card">
              <img
                src={
                  item.productImage ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
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
                      expandedItems[item._id] ? "expanded" : ""
                    }`}
                  >
                    {item.productDescription}
                  </p>
                  {item.productDescription &&
                    item.productDescription.split(/\s+/).length > 20 && (
                      <button
                        className="description-toggle-btn"
                        onClick={() => toggleDescription(item._id)}
                        title={
                          expandedItems[item._id] ? "Show Less" : "Show More"
                        }
                      >
                        {expandedItems[item._id] ? (
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
          ))}
        </div>
      )}

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
