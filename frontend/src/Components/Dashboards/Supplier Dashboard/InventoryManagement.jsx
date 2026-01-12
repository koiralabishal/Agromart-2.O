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
  FaTimes,
  FaCloudUploadAlt,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../../../api/axiosConfig";
import "./Styles/InventoryManagement.css";
import "../Common/Styles/EditInventoryModal.css";
import "../Collector Dashboard/Styles/AddInventoryView.css"; // Reuse some styles

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

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    productName: "",
    category: "",
    quantity: "",
    unit: "",
    price: "",
    productDescription: "",
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [editSuccessPopup, setEditSuccessPopup] = useState(false);
  
  const editFileInputRef = React.useRef(null);

  const toggleDescription = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showEditModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showEditModal]);

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

  const handleEditClick = (item) => {
    setItemToEdit(item);
    setEditFormData({
      productName: item.productName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      productDescription: item.productDescription,
    });
    setEditImagePreview(item.productImage);
    setEditImageFile(null);
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditImagePreview = (e) => {
    e.stopPropagation();
    setEditImageFile(null);
    setEditImagePreview(null); // Fully remove preview
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditErrors({});

    try {
      const data = new FormData();
      data.append("productName", editFormData.productName);
      data.append("category", editFormData.category);
      data.append("quantity", editFormData.quantity);
      data.append("unit", editFormData.unit);
      data.append("price", editFormData.price);
      data.append("productDescription", editFormData.productDescription);
      if (editImageFile) {
        data.append("productImage", editImageFile);
      }

      const itemId = itemToEdit._id || itemToEdit.id;
      await api.put(`/inventory/${itemId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setEditSuccessPopup(true);
    } catch (err) {
      console.error("Error updating inventory:", err);
      setEditErrors({
        submit: err.response?.data?.message || "Failed to update inventory",
      });
    } finally {
      setEditLoading(false);
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
                    <button 
                      className="im-action-btn edit-btn" 
                      title="Edit"
                      onClick={() => handleEditClick(item)}
                    >
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

      {/* Edit Inventory Modal */}
      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content ap-form"> {/* Reuse ap-form styles */}
            <div className="edit-modal-header">
              <h2>Edit Inventory</h2>
              <button className="close-modal-btn" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>

            {editErrors.submit && (
              <div className="ap-error-message">{editErrors.submit}</div>
            )}

            <form className="ap-form" onSubmit={handleUpdateSubmit} noValidate>
              <div className="ap-form-grid">
                <div className="ap-form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    value={editFormData.productName}
                    onChange={handleEditChange}
                    placeholder="e.g., Organic Tomatoes"
                  />
                </div>

                <div className="ap-form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                  >
                    <option value="">Select a category</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Grains">Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="ap-form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editFormData.quantity}
                    onChange={handleEditChange}
                    placeholder="e.g., 500"
                  />
                </div>

                <div className="ap-form-group">
                  <label>Unit</label>
                  <select
                    name="unit"
                    value={editFormData.unit}
                    onChange={handleEditChange}
                  >
                    <option value="">Select unit</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="tonne">Metric Ton (Tonne)</option>
                    <option value="quintal">Quintal</option>
                    <option value="liter">Liter (L)</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="piece">Piece</option>
                    <option value="dozen">Dozen</option>
                    <option value="bundle">Bundle</option>
                    <option value="box">Box</option>
                    <option value="bag">Bag</option>
                    <option value="crate">Crate</option>
                    <option value="sack">Sack</option>
                  </select>
                </div>

                <div className="ap-form-group">
                  <label>Expected Price (per unit)</label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditChange}
                    placeholder="e.g., 2.50"
                  />
                </div>

                <div className="ap-form-group full-width">
                  <label>Product Description</label>
                  <textarea
                    name="productDescription"
                    value={editFormData.productDescription}
                    onChange={handleEditChange}
                    placeholder="Describe your product..."
                    rows="4"
                  ></textarea>
                </div>

                <div className="ap-form-group full-width">
                  <label>Product Image</label>
                  <div
                    className="ap-upload-area has-preview"
                    onClick={() => editFileInputRef.current.click()}
                  >
                    {editImagePreview ? (
                      <div className="ap-preview-wrapper">
                        <div className="ap-preview-card">
                          <img
                            src={editImagePreview}
                            alt="Preview"
                            className="ap-preview-img"
                          />
                          <button
                            type="button"
                            className="ap-remove-img"
                            onClick={removeEditImagePreview}
                          >
                            <FaTimes />
                          </button>
                          <div className="ap-file-info">
                            <span className="ap-file-name">
                              {editImageFile ? editImageFile.name : "Current Image"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="ap-upload-icon" />
                        <p>Upload Product Image</p>
                      </>
                    )}
                    <input
                      type="file"
                      ref={editFileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleEditImageChange}
                    />
                  </div>
                </div>
              </div>

              <div className="ap-form-footer">
                <button
                  type="button"
                  className="ap-cancel-btn"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="ap-submit-btn" disabled={editLoading}>
                  {editLoading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Edit Popup */}
      {editSuccessPopup && (
        <div className="ep-success-overlay">
          <div className="ep-success-popup">
            <FaCheckCircle className="ep-success-icon" />
            <h3>Updated!</h3>
            <p>Your inventory has been updated successfully.</p>
            <button 
              className="ep-success-btn" 
              onClick={() => {
                setEditSuccessPopup(false);
                setShowEditModal(false);
                fetchInventory();
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
