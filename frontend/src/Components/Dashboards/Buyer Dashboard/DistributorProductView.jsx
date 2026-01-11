import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaPlus,
  FaBox,
  FaCheckCircle,
  FaSearch,
  FaLayerGroup,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import api from "../../../api/axiosConfig";
import "./Styles/DistributorProductView.css";

const DistributorProductView = ({ distributor, onBack, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Immediate data: Use local storage cache for this specific distributor
  const [products, setProducts] = useState(() => {
    const distributorId = distributor?._id || distributor?.id;
    if (!distributorId) return null;
    const cached = localStorage.getItem(`cached_distributor_products_${distributorId}`);
    return cached ? JSON.parse(cached) : null;
  });
  const [error, setError] = useState(null);
  const [addedItem, setAddedItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState({});

  useEffect(() => {
    if (distributor) {
      fetchDistributorProducts();
    }
  }, [distributor]);

  const fetchDistributorProducts = async () => {
    try {
      const distributorId = distributor._id || distributor.id;
      const response = await api.get(`/inventory?userID=${distributorId}`);
      setProducts(response.data);
      // Cache the result for this specific distributor
      localStorage.setItem(`cached_distributor_products_${distributorId}`, JSON.stringify(response.data));
      setError(null);
    } catch (err) {
      console.error("Error fetching distributor products:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch products");
      setProducts((prev) => prev || []); // Fallback to empty if no cache
    }
  };

  const toggleDescription = (id) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Hard safety check
  if (!distributor) return null;

  const filteredProducts = (products || []).filter((p) =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  return (
    <div className="inventory-management">
      <div className="im-header">
        <div className="im-title-area">
          <h2>Products from {distributor.name}</h2>
        </div>
        <div className="im-header-actions">
          <div className="search-bar-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="back-to-farmers" onClick={onBack}>
            <FaArrowLeft /> Back to Distributors
          </button>
        </div>
      </div>

      <div className="inventory-grid">
        {error ? (
          <div className="im-empty error">
            <p>Error: {error}</p>
            <button onClick={fetchDistributorProducts} className="retry-btn">
              Retry
            </button>
          </div>
        ) : products === null ? (
          <div className="im-empty">
            {/* Subtle empty space while loading */}
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const isOutOfStock = product.availableStatus === "Out of Stock" || product.quantity <= 0;

            return (
              <div key={product._id || product.id} className="inventory-card">
                <img
                  src={product.productImage || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt={product.productName}
                  className="inventory-image"
                />
                <div className="inventory-info">
                  <div className="inventory-info-header">
                    <div className="inventory-name-area">
                      <h3>{product.productName}</h3>
                      <p className="inventory-category">{product.category}</p>
                    </div>
                    <button
                      className="add-cart-btn-small"
                      disabled={isOutOfStock}
                      onClick={async () => {
                        await onAddToCart(product);
                        setAddedItem(product);
                        setShowPopup(true);
                        // Update local state for immediate feedback
                        setProducts((prevProducts) =>
                          prevProducts.map((p) =>
                            (p._id || p.id) === (product._id || product.id)
                              ? { ...p, quantity: Math.max(0, p.quantity - 1) }
                              : p
                          )
                        );
                      }}
                      title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    >
                      <FaPlus /> {isOutOfStock ? "No Stock" : "Add"}
                    </button>
                  </div>

                  <div className="item-description-container">
                    <p
                      className={`item-description ${
                        expandedProducts[product._id || product.id] ? "expanded" : ""
                      }`}
                    >
                      {product.productDescription}
                    </p>
                    {product.productDescription &&
                      product.productDescription.split(/\s+/).length > 20 && (
                        <button
                          className="description-toggle-btn"
                          onClick={() => toggleDescription(product._id || product.id)}
                          title={
                            expandedProducts[product._id || product.id]
                              ? "Show Less"
                              : "Show More"
                          }
                        >
                          {expandedProducts[product._id || product.id] ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </button>
                      )}
                  </div>

                  <div className="inventory-details">
                    <span className="price-tag">
                      Rs. {product.price}/{product.unit}
                    </span>
                    <div className="qty-wrapper">
                      <FaBox className="im-detail-icon" />
                      <span>{product.quantity} {product.unit}</span>
                    </div>
                    <span
                      className={`im-status-tag ${
                        !isOutOfStock
                          ? "status-available"
                          : "status-out-of-stock"
                      }`}
                    >
                      {!isOutOfStock ? "Available" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="im-empty">
            <FaLayerGroup className="empty-icon" />
            <p>No products available from this distributor at the moment.</p>
          </div>
        )}
      </div>

      {showPopup && addedItem && (
        <div className="cart-popup-overlay" onClick={() => setShowPopup(false)}>
          <div
            className="cart-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-popup-img-wrapper">
               <img src={addedItem.productImage || "https://via.placeholder.com/300x200?text=No+Image"} alt={addedItem.productName} className="cart-popup-product-img" />
               <div className="cart-popup-check-badge">
                 <FaCheckCircle />
               </div>
            </div>
            <h3>Added to Cart!</h3>
            <p>
              <strong>{addedItem.productName}</strong> has been successfully added to your
              cart.
            </p>
            <button
              className="cart-popup-btn"
              onClick={() => setShowPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorProductView;
