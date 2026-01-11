import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrashAlt, FaBox, FaSearch, FaSyncAlt } from "react-icons/fa";
import "./Styles/ProductManagement.css";

const ProductManagement = ({ onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user?._id || user?.id;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products?userID=${userID}`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userID) {
      fetchProducts();
    }
  }, [userID]);

  const filteredProducts = products.filter((product) =>
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

      {!loading && products.length === 0 ? (
        <div className="pm-empty">
          <FaBox className="empty-icon" />
          <p>No products added yet! Start listing your harvest to reach more buyers.</p>
          <button onClick={onAddProduct} className="pm-empty-add-btn">
            <FaPlus /> Add Your First Product
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.productImage || "https://via.placeholder.com/300x200?text=No+Image"}
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
                    <button className="pm-action-btn delete-btn" title="Delete">
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>

                <div className="product-details">
                  <span className="price-tag">
                    Rs. {product.price}/{product.unit}
                  </span>
                  <div className="qty-wrapper">
                    <FaBox className="pm-detail-icon" />
                    <span>{product.quantity} {product.unit}</span>
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
    </div>
  );
};

export default ProductManagement;
