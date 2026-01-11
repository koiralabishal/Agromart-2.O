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
import "./Styles/ProductManagement.css";

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
                    <button className="pm-action-btn edit-btn" title="Edit">
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
    </div>
  );
};

export default ProductManagement;
