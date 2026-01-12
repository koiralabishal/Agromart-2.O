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
  FaCloudUploadAlt,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../../../api/axiosConfig";
import "./Styles/ProductManagement.css";
import "./Styles/EditProductModal.css";
import "./Styles/AddProductView.css"; // Reuse some styles

const ProductManagement = ({ onAddProduct, preFetchedProducts }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user?._id || user?.id;

  // Immediate data: use pre-fetched data if available, otherwise check local storage cache
  const [products, setProducts] = useState(() => {
    if (preFetchedProducts) return preFetchedProducts;
    const cached = localStorage.getItem(`cached_farmer_products_${userID}`);
    return cached ? JSON.parse(cached) : null;
  });
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState({});

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
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

  const toggleDescription = (id) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get(`/products?userID=${userID}`);
      setProducts(response.data);
      localStorage.setItem(`cached_farmer_products_${userID}`, JSON.stringify(response.data));
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch products");
      setProducts((prev) => prev || []); // Fallback to empty if no cache
    }
  };

  useEffect(() => {
    if (preFetchedProducts) {
      setProducts(preFetchedProducts);
    }
    if (userID) {
      fetchProducts();
    }
  }, [userID, preFetchedProducts]);

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleExecuteDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await api.delete(`/products/${productToDelete._id}`);

      // Success
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Error deleting product: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
    setEditFormData({
      productName: product.productName,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      price: product.price,
      productDescription: product.productDescription,
    });
    setEditImagePreview(product.productImage);
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

      await api.put(`/products/${productToEdit._id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setEditSuccessPopup(true);
    } catch (err) {
      console.error("Error updating product:", err);
      setEditErrors({
        submit: err.response?.data?.message || "Failed to update product",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const filteredProducts = (products || []).filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="product-management">
      <div className="pm-header">
        <h2>Product Management</h2>
        <div className="pm-header-actions">
          <div className="search-bar-container">
            <FaSearch style={{ color: "grey" }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-product-btn" onClick={onAddProduct}>
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      {products === null ? (
        <div className="pm-empty">
          {/* Subtle space while fetching */}
        </div>
      ) : products.length === 0 ? (
        <div className="pm-empty">
          <FaBox className="empty-icon" />
          <p>
            No products added yet! Start listing your harvest to reach more
            buyers.
          </p>
          <button onClick={onAddProduct} className="pm-empty-add-btn">
            <FaPlus /> Add Your First Product
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={
                  product.productImage ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={product.productName}
                className="product-image"
              />
              <div className="product-info">
                <div className="product-info-header">
                  <div className="product-name-area">
                    <h3>{product.productName}</h3>
                    <p className="product-category">{product.category}</p>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="pm-action-btn edit-btn" 
                      title="Edit"
                      onClick={() => handleEditClick(product)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="pm-action-btn delete-btn"
                      title="Delete"
                      onClick={() => confirmDelete(product)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>

                <div className="product-description-container">
                  <p className={`product-card-description ${expandedProducts[product._id] ? 'expanded' : ''}`}>
                    {product.productDescription}
                  </p>
                  {product.productDescription && product.productDescription.split(/\s+/).length > 20 && (
                    <button
                      className="description-toggle-btn"
                      onClick={() => toggleDescription(product._id)}
                      title={expandedProducts[product._id] ? "Show Less" : "Show More"}
                    >
                      {expandedProducts[product._id] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  )}
                </div>

                <div className="product-details">
                  <span className="price-tag">
                    Rs. {product.price}/{product.unit}
                  </span>
                  <div className="qty-wrapper">
                    <FaBox className="pm-detail-icon" />
                    <span>
                      {product.quantity} {product.unit}
                    </span>
                  </div>
                  <span
                    className={`pm-status-tag ${
                      product.availableStatus === "Available"
                        ? "status-available"
                        : "status-out-of-stock"
                    }`}
                  >
                    {product.availableStatus}
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
              <strong>{productToDelete?.productName}</strong>? This action is
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
                {isDeleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content ap-form"> {/* Reuse ap-form styles */}
            <div className="edit-modal-header">
              <h2>Edit Product</h2>
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
            <p>Your product has been updated successfully.</p>
            <button 
              className="ep-success-btn" 
              onClick={() => {
                setEditSuccessPopup(false);
                setShowEditModal(false);
                fetchProducts();
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

export default ProductManagement;
