import React from "react";
import { FaCheckCircle, FaChevronRight } from "react-icons/fa";
import "./Styles/StockSuccessModal.css";

const StockSuccessModal = ({ isOpen, onClose, products = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="stock-success-overlay">
      <div className="stock-success-card">
        <div className="success-icon-wrapper">
          <FaCheckCircle className="success-check-icon" />
        </div>
        
        <h2 className="success-title">Successfully added to the inventory</h2>
        
        <p className="success-message">
          The following products have been moved to your inventory and are now ready for sale:
        </p>

        <div className="stocked-products-list">
          {products.map((item, index) => (
            <div key={index} className="stocked-product-item">
              <FaChevronRight className="item-arrow" />
              <div className="stocked-item-details">
                <span className="stocked-item-name">{item.name}</span>
                <span className="stocked-item-qty">Qty: {item.quantity} {item.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="stock-success-ok-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default StockSuccessModal;
