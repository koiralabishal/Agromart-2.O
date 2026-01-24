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
  FaTimes,
  FaCloudUploadAlt,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../../../api/axiosConfig";
import "./Styles/InventoryManagement.css";
import "../Common/Styles/EditInventoryModal.css";
import "./Styles/AddInventoryView.css"; // Reuse some styles

const InventoryManagement = ({ onAddInventory, initialInventory }) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Immediate data: Use props if available, otherwise local storage cache
  const [inventory, setInventory] = useState(() => {
    if (initialInventory && initialInventory.length > 0)
      return initialInventory;
    const cached = localStorage.getItem("cached_inventory");
    return cached ? JSON.parse(cached) : null;
  });
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

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
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch inventory",
      );
      setInventory((prev) => prev || []); // Fallback to empty if no cache
    }
  };

  // Sync internal state when props change
  useEffect(() => {
    if (initialInventory) {
      setInventory(initialInventory);
      localStorage.setItem(
        "cached_inventory",
        JSON.stringify(initialInventory),
      );
    }
  }, [initialInventory]);

  useEffect(() => {
    if (userID) {
      // If props already provided data, skip initial fetch
      if (initialInventory?.length > 0) return;
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
      alert(
        "Error deleting item: " + (err.response?.data?.message || err.message),
      );
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

      await api.put(`/inventory/${itemToEdit._id}`, data, {
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

  const filteredInventory = (inventory || []).filter((item) =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()),
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

      {inventory?.length === 0 ? (
        <div className="im-empty">
          <FaBox className="empty-icon" />
          <h3>No Inventory Items Found</h3>
          <p>You haven't added any products to your inventory yet.</p>
          <button className="im-add-btn" onClick={onAddInventory}>
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

      {/* Edit Inventory Modal */}
      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content ap-form">
            {" "}
            {/* Reuse ap-form styles */}
            <div className="edit-modal-header">
              <h2>Edit Inventory</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowEditModal(false)}
              >
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
                              {editImageFile
                                ? editImageFile.name
                                : "Current Image"}
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
                <button
                  type="submit"
                  className="ap-submit-btn"
                  disabled={editLoading}
                >
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
