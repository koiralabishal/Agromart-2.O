import React, { useState } from "react";
import { FaTimes, FaBox, FaCheckCircle, FaTag, FaRobot } from "react-icons/fa";
import RecommendedPricePopup from "./RecommendedPricePopup";
import "./Styles/StockOrderModal.css";

const StockOrderModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  order, 
  isLoading,
  enableRecommendation = false 
}) => {
  const [items, setItems] = useState(
    order?.products.map((p) => ({
      productID: p.productID,
      productName: p.productName,
      quantity: p.quantity,
      unit: p.unit,
      costPrice: p.price,
      sellingPrice: "",
      category: p.category,
      image: p.image
    })) || []
  );

  const [errors, setErrors] = useState({});
  const [recommendationTarget, setRecommendationTarget] = useState(null);

  if (!isOpen) return null;

  const handlePriceChange = (index, value) => {
    const newItems = [...items];
    newItems[index].sellingPrice = value;
    setItems(newItems);
    
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const handleRecommendationConfirm = (price) => {
    if (recommendationTarget !== null) {
      handlePriceChange(recommendationTarget, price);
      setRecommendationTarget(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    items.forEach((item, index) => {
      if (!item.sellingPrice || Number(item.sellingPrice) <= 0) {
        newErrors[index] = "Required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm(items);
  };

  return (
    <div className="som-overlay">
      <div className="som-content">
        <div className="som-header">
          <div className="som-title-area">
            <FaBox className="som-title-icon" />
            <div>
              <h2>Add Order Items to Inventory</h2>
              <p>Order #{order.orderID}</p>
            </div>
          </div>
          <button className="som-close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="som-body">
            <div className="som-table-wrapper">
              <table className="som-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Cost Price</th>
                    <th>Selling Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="som-product-info">
                          <img src={item.image || "https://via.placeholder.com/40"} alt={item.productName} />
                          <span>{item.productName}</span>
                        </div>
                      </td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>Rs. {item.costPrice}</td>
                      <td>
                        <div className={`som-input-group ${errors[index] ? 'has-error' : ''}`}>
                          <span className="som-currency">Rs.</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Set price"
                            value={item.sellingPrice}
                            onChange={(e) => handlePriceChange(index, e.target.value)}
                            disabled={isLoading}
                          />
                          {enableRecommendation && (
                            <button
                              type="button"
                              className="som-recommend-btn"
                              title="Get AI Pricing Recommendation"
                              onClick={() => setRecommendationTarget(index)}
                              disabled={isLoading}
                            >
                              <FaRobot />
                              <span className="som-btn-text">AI</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="som-footer">
            <div className="som-info-note">
              <FaTag /> Selling price will be used for your warehouse listings.
            </div>
            <div className="som-actions">
              <button type="button" className="som-btn-secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="som-btn-primary" disabled={isLoading}>
                {isLoading ? "Processing..." : "Set Price & Add to Inventory"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {enableRecommendation && (
        <RecommendedPricePopup
          isOpen={recommendationTarget !== null}
          onClose={() => setRecommendationTarget(null)}
          onConfirm={handleRecommendationConfirm}
          productName={recommendationTarget !== null ? items[recommendationTarget].productName : ""}
        />
      )}
    </div>
  );
};

export default StockOrderModal;
