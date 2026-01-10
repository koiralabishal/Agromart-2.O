import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrashAlt, FaBox, FaSearch } from "react-icons/fa";
import "./Styles/InventoryManagement.css";

// Import local assets
import appleImg from "../../../assets/products/apple-fruit.jpg";
import bananaImg from "../../../assets/products/banana.jpeg";
import broccoliImg from "../../../assets/products/broccoli.jpeg";
import cabbageImg from "../../../assets/products/cabbage.jpeg";
import cauliflowerImg from "../../../assets/products/cauliflower.jpeg";
import orangeImg from "../../../assets/products/orange.jpeg";

const InventoryManagement = ({ onAddInventory }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const inventoryItems = [
    {
      id: 1,
      name: "Fresh Red Tomatoes",
      category: "Vegetable",
      price: 120,
      unit: "kg",
      quantity: "1500 kg",
      status: "Available",
      image: cauliflowerImg,
    },
    {
      id: 2,
      name: "Organic Potatoes",
      category: "Vegetable",
      price: 60,
      unit: "kg",
      quantity: "800 kg",
      status: "Available",
      image: broccoliImg,
    },
    {
      id: 3,
      name: "Golden Delicious Apples",
      category: "Fruit",
      price: 250,
      unit: "kg",
      quantity: "0 kg",
      status: "Out of Stock",
      image: appleImg,
    },
    {
      id: 4,
      name: "Fresh Spinach",
      category: "Leafy Greens",
      price: 40,
      unit: "bundle",
      quantity: "0 bundles",
      status: "Out of Stock",
      image: cabbageImg,
    },
    {
      id: 5,
      name: "Organic Carrots",
      category: "Vegetable",
      price: 80,
      unit: "kg",
      quantity: "600 kg",
      status: "Available",
      image: orangeImg,
    },
    {
      id: 6,
      name: "Valencia Oranges",
      category: "Fruit",
      price: 180,
      unit: "kg",
      quantity: "0 kg",
      status: "Out of Stock",
      image: bananaImg,
    },
    {
      id: 7,
      name: "Seasonal Mangoes",
      category: "Fruit",
      price: 150,
      unit: "kg",
      quantity: "0 kg",
      status: "Out of Stock",
      image: appleImg,
    },
    {
      id: 8,
      name: "Ginger Root",
      category: "Vegetable",
      price: 200,
      unit: "kg",
      quantity: "50 kg",
      status: "Available",
      image: cauliflowerImg,
    },
  ];

  const filteredItems = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inventory-management">
      <div className="im-header">
        <h2>Inventory Management</h2>
        <div className="im-header-actions">
          <div className="search-bar-container">
           <FaSearch style={{color:"grey"}}/>
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
        {filteredItems.map((item) => (
          <div key={item.id} className="inventory-card">
            <img src={item.image} alt={item.name} className="inventory-image" />
            <div className="inventory-info">
              <div className="inventory-info-header">
                <div className="inventory-name-area">
                  <h3>{item.name}</h3>
                  <p className="inventory-category">{item.category}</p>
                </div>
                <div className="inventory-actions">
                  <button className="im-action-btn edit-btn" title="Edit">
                    <FaEdit />
                  </button>
                  <button className="im-action-btn delete-btn" title="Delete">
                    <FaTrashAlt />
                  </button>
                </div>
              </div>

              <div className="inventory-details">
                <span className="price-tag">
                  Rs. {item.price}/{item.unit}
                </span>
                <div className="qty-wrapper">
                  <FaBox className="im-detail-icon" />
                  <span>{item.quantity}</span>
                </div>
                <span
                  className={`im-status-tag ${
                    item.status === "Available"
                      ? "status-available"
                      : "status-out-of-stock"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryManagement;
