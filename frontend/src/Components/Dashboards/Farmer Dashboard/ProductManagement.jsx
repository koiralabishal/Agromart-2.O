import React from "react";
import { FaPlus, FaEdit, FaTrash, FaBox } from "react-icons/fa";
import "./Styles/ProductManagement.css";

// Import local assets from the main assets folder
import appleImg from "../../../assets/products/apple-fruit.jpg";
import bananaImg from "../../../assets/products/banana.jpeg";
import broccoliImg from "../../../assets/products/broccoli.jpeg";
import cabbageImg from "../../../assets/products/cabbage.jpeg";
import cauliflowerImg from "../../../assets/products/cauliflower.jpeg";
import orangeImg from "../../../assets/products/orange.jpeg";

const ProductManagement = ({ onAddProduct }) => {
  const products = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      category: "Vegetable",
      quantity: "150 kg",
      status: "Available",
      image: cauliflowerImg,
    },
    {
      id: 2,
      name: "Sweet Potatoes",
      category: "Vegetable",
      quantity: "75 kg",
      status: "Ordered",
      image: broccoliImg,
    },
    {
      id: 3,
      name: "Organic Apples",
      category: "Fruit",
      quantity: "0 kg",
      status: "Out of Stock",
      image: appleImg,
    },
    {
      id: 4,
      name: "Farm Blueberries",
      category: "Fruit",
      quantity: "200 kg",
      status: "Available",
      image: bananaImg,
    },
    {
      id: 5,
      name: "Spinach Bags",
      category: "Vegetable",
      quantity: "120 kg",
      status: "Available",
      image: cabbageImg,
    },
    {
      id: 6,
      name: "Concord Grapes",
      category: "Fruit",
      quantity: "60 kg",
      status: "Ordered",
      image: orangeImg,
    },
    {
      id: 7,
      name: "Garden Cucumbers",
      category: "Vegetable",
      quantity: "90 kg",
      status: "Available",
      image: cauliflowerImg,
    },
    {
      id: 8,
      name: "Harvest Pumpkins",
      category: "Vegetable",
      quantity: "0 kg",
      status: "Out of Stock",
      image: broccoliImg,
    },
    {
      id: 9,
      name: "Valencia Oranges",
      category: "Fruit",
      quantity: "180 kg",
      status: "Available",
      image: orangeImg,
    },
  ];

  return (
    <div className="product-management">
      <div className="pm-header">
        <h2>Product Management</h2>
        <button className="add-product-btn" onClick={onAddProduct}>
          <FaPlus /> Add Product
        </button>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <div className="product-info">
              <div className="product-info-header">
                <div className="product-name-area">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                </div>
                <div className="product-actions">
                  <button className="action-btn edit-btn" title="Edit">
                    <FaEdit />
                  </button>
                  <button className="action-btn delete-btn" title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="product-details">
                <FaBox className="detail-icon" />
                <span>Quantity: {product.quantity}</span>
              </div>

              <div className="product-status-area">
                <span
                  className={`status-tag ${
                    product.status === "Available"
                      ? "status-available"
                      : product.status === "Ordered"
                      ? "status-ordered"
                      : "status-out-of-stock"
                  }`}
                >
                  {product.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;
