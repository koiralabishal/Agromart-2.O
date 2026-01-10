import React, { useState } from "react";
import {
  FaArrowLeft,
  FaPlus,
  FaBox,
  FaCheckCircle,
  FaSearch,
} from "react-icons/fa";
import "./Styles/DistributorProductView.css";

// Import local assets
import appleImg from "../../../assets/products/apple-fruit.jpg";
import bananaImg from "../../../assets/products/banana.jpeg";
import broccoliImg from "../../../assets/products/broccoli.jpeg";
import cabbageImg from "../../../assets/products/cabbage.jpeg";
import cauliflowerImg from "../../../assets/products/cauliflower.jpeg";
import orangeImg from "../../../assets/products/orange.jpeg";

const DistributorProductView = ({ distributor, onBack, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [addedItem, setAddedItem] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  // Hard safety check
  if (!distributor) return null;

  // Mock products with local assets
  const products = [
    {
      id: 101,
      name: "Fresh Red Tomatoes",
      category: "Vegetables",
      price: 120,
      unit: "kg",
      stock: "500 kg",
      image: cauliflowerImg,
    },
    {
      id: 102,
      name: "Organic Potatoes",
      category: "Vegetables",
      price: 60,
      unit: "kg",
      stock: "1000 kg",
      image: broccoliImg,
    },
    {
      id: 103,
      name: "Green Spinach",
      category: "Leafy Greens",
      price: 40,
      unit: "bundle",
      stock: "0 bundles",
      image: cabbageImg,
    },
    {
      id: 104,
      name: "Sweet Apples",
      category: "Fruits",
      price: 250,
      unit: "kg",
      stock: "300 kg",
      image: appleImg,
    },
    {
      id: 105,
      name: "Juicy Oranges",
      category: "Fruits",
      price: 180,
      unit: "kg",
      stock: "450 kg",
      image: orangeImg,
    },
    {
      id: 106,
      name: "Fresh Bananas",
      category: "Fruits",
      price: 100,
      unit: "dozen",
      stock: "150 dozen",
      image: bananaImg,
    },
    {
      id: 107,
      name: "Green Broccoli",
      category: "Vegetables",
      price: 150,
      unit: "kg",
      stock: "100 kg",
      image: broccoliImg,
    },
    {
      id: 108,
      name: "White Cauliflower",
      category: "Vegetables",
      price: 90,
      unit: "piece",
      stock: "300 pieces",
      image: cauliflowerImg,
    },
    {
      id: 109,
      name: "Crisp Cabbage",
      category: "Vegetables",
      price: 50,
      unit: "kg",
      stock: "400 kg",
      image: cabbageImg,
    },
    {
      id: 110,
      name: "Red Apples",
      category: "Fruits",
      price: 260,
      unit: "kg",
      stock: "200 kg",
      image: appleImg,
    },
    {
      id: 111,
      name: "Organic Tomatoes",
      category: "Vegetables",
      price: 130,
      unit: "kg",
      stock: "350 kg",
      image: cauliflowerImg,
    },
    {
      id: 112,
      name: "Baby Potatoes",
      category: "Vegetables",
      price: 70,
      unit: "kg",
      stock: "600 kg",
      image: broccoliImg,
    },
    {
      id: 113,
      name: "Fresh Lettuce",
      category: "Leafy Greens",
      price: 80,
      unit: "kg",
      stock: "100 kg",
      image: cabbageImg,
    },
    {
      id: 114,
      name: "Sunshine Oranges",
      category: "Fruits",
      price: 190,
      unit: "kg",
      stock: "250 kg",
      image: orangeImg,
    },
    {
      id: 115,
      name: "Sweet Bananas",
      category: "Fruits",
      price: 110,
      unit: "dozen",
      stock: "0 dozen",
      image: bananaImg,
    },
    {
      id: 116,
      name: "Seasonal Mangoes",
      category: "Fruits",
      price: 150,
      unit: "kg",
      stock: "0 kg",
      image: appleImg,
    },
  ];

  return (
    <div className="inventory-management">
      <div className="im-header">
        <h2>Products from {distributor.name}</h2>
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
          <button className="add-inventory-btn" onClick={onBack}>
            <FaArrowLeft /> Back to Distributors
          </button>
        </div>
      </div>

      <div className="inventory-grid">
        {products
          .filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((product) => {
            const stockVal = parseInt(product.stock);
            const isOutOfStock = stockVal === 0;

            return (
              <div key={product.id} className="inventory-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="inventory-image"
                />
                <div className="inventory-info">
                  <div className="inventory-info-header">
                    <div className="inventory-name-area">
                      <h3>{product.name}</h3>
                      <p className="inventory-category">{product.category}</p>
                    </div>
                    <button
                      className="add-cart-btn-small"
                      disabled={isOutOfStock}
                      onClick={() => {
                        onAddToCart(product);
                        setAddedItem(product.name);
                        setShowPopup(true);
                      }}
                      title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    >
                      <FaPlus /> {isOutOfStock ? "No Stock" : "Add"}
                    </button>
                  </div>

                  <div className="inventory-details">
                    <span className="price-tag">
                      Rs. {product.price}/{product.unit}
                    </span>
                    <div className="qty-wrapper">
                      <FaBox className="im-detail-icon" />
                      <span>{product.stock}</span>
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
          })}
      </div>

      {showPopup && (
        <div className="cart-popup-overlay" onClick={() => setShowPopup(false)}>
          <div
            className="cart-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-popup-icon">
              <FaCheckCircle />
            </div>
            <h3>Added to Cart!</h3>
            <p>
              <strong>{addedItem}</strong> has been successfully added to your
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
