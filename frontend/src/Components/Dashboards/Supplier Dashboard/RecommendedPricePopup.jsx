import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./Styles/RecommendedPricePopup.css";

const RecommendedPricePopup = ({ isOpen, onClose, onConfirm }) => {
  const [productPrices, setProductPrices] = useState({
    1: { option: "recommended", customPrice: "", rangePrice: "" },
    2: { option: "recommended", customPrice: "", rangePrice: "" },
    3: { option: "recommended", customPrice: "", rangePrice: "" },
    4: { option: "recommended", customPrice: "", rangePrice: "" },
  });
  const [errors, setErrors] = useState({});

  const products = [
    { id: 1, name: "Tomato", priceMin: 58, priceMax: 65 },
    { id: 2, name: "Potato", priceMin: 42, priceMax: 48 },
    { id: 3, name: "Onion", priceMin: 50, priceMax: 56 },
    { id: 4, name: "Cabbage", priceMin: 30, priceMax: 35 },
  ];

  const handleOptionChange = (productId, option) => {
    setProductPrices((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], option },
    }));
    // Clear error for this product when option changes
    if (errors[productId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[productId];
        return newErrors;
      });
    }
  };

  const handleInputChange = (productId, field, value) => {
    setProductPrices((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
    // Clear error for this product when input changes
    if (errors[productId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[productId];
        return newErrors;
      });
    }
  };

  const handleConfirmPrice = (product) => {
    const priceData = productPrices[product.id];
    let finalPrice;

    if (priceData.option === "recommended") {
      finalPrice =
        priceData.rangePrice ||
        ((product.priceMin + product.priceMax) / 2).toString();

      // Validation: Must be within range
      const numericPrice = parseFloat(finalPrice);
      if (
        isNaN(numericPrice) ||
        numericPrice < product.priceMin ||
        numericPrice > product.priceMax
      ) {
        setErrors((prev) => ({
          ...prev,
          [product.id]: `Price must be between NPR ${product.priceMin} - ${product.priceMax}`,
        }));
        return;
      }
    } else {
      finalPrice = priceData.customPrice;
      const numericPrice = parseFloat(finalPrice);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        setErrors((prev) => ({
          ...prev,
          [product.id]: "Please enter a valid custom price",
        }));
        return;
      }
    }

    onConfirm(finalPrice);
  };

  if (!isOpen) return null;

  return (
    <div className="rpp-overlay" onClick={onClose}>
      <div className="rpp-container" onClick={(e) => e.stopPropagation()}>
        <div className="rpp-header">
          <div className="rpp-logo">
            <span className="rpp-logo-icon">🌱</span>
            <span className="rpp-logo-text">AgroMart</span>
          </div>
          <button className="rpp-back-btn" onClick={onClose}>
            Back
          </button>
        </div>

        <h2 className="rpp-title">Recommended Price</h2>

        <div className="rpp-products-grid">
          {products.map((product) => (
            <div key={product.id} className="rpp-product-card">
              <h3 className="rpp-product-name">{product.name}</h3>

              <div className="rpp-price-badge">
                NPR {product.priceMin} – {product.priceMax} / kg
                <span className="rpp-price-subtitle">
                  Based on market demand & trends
                </span>
              </div>

              <div className="rpp-options">
                <div className="rpp-option">
                  <input
                    type="radio"
                    id={`recommended-${product.id}`}
                    name={`price-option-${product.id}`}
                    checked={productPrices[product.id].option === "recommended"}
                    onChange={() =>
                      handleOptionChange(product.id, "recommended")
                    }
                  />
                  <label htmlFor={`recommended-${product.id}`}>
                    Accept Recommended Price
                  </label>
                  <input
                    type="text"
                    className={`rpp-input ${errors[product.id] && productPrices[product.id].option === "recommended" ? "invalid" : ""}`}
                    placeholder="Enter price within a range"
                    disabled={
                      productPrices[product.id].option !== "recommended"
                    }
                    value={productPrices[product.id].rangePrice}
                    onChange={(e) =>
                      handleInputChange(
                        product.id,
                        "rangePrice",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="rpp-option">
                  <input
                    type="radio"
                    id={`custom-${product.id}`}
                    name={`price-option-${product.id}`}
                    checked={productPrices[product.id].option === "custom"}
                    onChange={() => handleOptionChange(product.id, "custom")}
                  />
                  <label htmlFor={`custom-${product.id}`}>
                    Set My Own Price
                  </label>
                  <input
                    type="text"
                    className={`rpp-input ${errors[product.id] && productPrices[product.id].option === "custom" ? "invalid" : ""}`}
                    placeholder="Enter your own price"
                    disabled={productPrices[product.id].option !== "custom"}
                    value={productPrices[product.id].customPrice}
                    onChange={(e) =>
                      handleInputChange(
                        product.id,
                        "customPrice",
                        e.target.value
                      )
                    }
                  />
                </div>
                
                {errors[product.id] && (
                  <span className="rpp-field-error">{errors[product.id]}</span>
                )}
              </div>

              <button
                className="rpp-confirm-btn"
                onClick={() => handleConfirmPrice(product)}
              >
                Confirm Price
              </button>
            </div>
          ))}
        </div>

        <footer className="rpp-footer">
          <div className="rpp-footer-text">
            © {new Date().getFullYear()} AgroMart. All rights reserved.
          </div>
          <div className="rpp-footer-socials">
            <span>f</span>
            <span>t</span>
            <span>in</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RecommendedPricePopup;
