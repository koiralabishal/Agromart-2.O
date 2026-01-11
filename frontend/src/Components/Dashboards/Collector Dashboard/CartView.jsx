import React from "react";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaShoppingCart,
} from "react-icons/fa";
import "./Styles/CartView.css";

const CartView = ({ cartItems, onUpdateQuantity, onRemoveItem, onBack }) => {
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = cartItems.length > 0 ? 5.0 : 0;
  const grandTotal = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="cart-view-container empty-cart-container">
        <div className="empty-cart-content">
          <div className="empty-cart-icon">
            <FaShoppingCart />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any fresh produce yet.</p>
          <button className="go-shopping-btn" onClick={onBack}>
            <FaArrowLeft /> Go Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-view-container">
      <div className="cart-header-row">
        <button className="back-btn-cart" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
        <h1>Your Shopping Cart</h1>
        <div style={{ width: "80px" }}></div> {/* Spacer for centering */}
      </div>

      <div className="cart-content-grid">
        {/* Left Side: Items */}
        <div className="cart-items-section">
          <div className="cart-items-list">
            {cartItems.map((item) => {
              const itemId = item._id || item.id;
              const itemName = item.productName || item.name;
              const itemImage =
                item.productImage ||
                item.image ||
                "https://via.placeholder.com/200?text=Product";

              return (
                <div key={itemId} className="cart-item-card">
                  <div className="item-image">
                    <img src={itemImage} alt={itemName} />
                  </div>
                  <div className="item-info">
                    <div className="info-main">
                      <h3>{itemName}</h3>
                      <p>{item.category}</p>
                    </div>
                    <div className="info-price">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="item-controls">
                    <button onClick={() => onUpdateQuantity(itemId, -1)}>
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(itemId, 1)}>
                      <FaPlus />
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => onRemoveItem(itemId)}
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Summary */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <h2>Order Summary</h2>
            <div className="summary-line">
              <span>Item Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Shipping</span>
              <span>Rs. {shipping.toFixed(2)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-line grand-total">
              <span>Grand Total</span>
              <span className="total-amount">Rs. {grandTotal.toFixed(2)}</span>
            </div>

            <div className="delivery-info">
              <h3>Delivery Information</h3>
              <p className="delivery-label">Delivery Address</p>
              <div className="address-box">
                <p>123 Green Lane, Agroville, 56789, Nepal</p>
              </div>
              <button className="change-address-btn">Change Address</button>
            </div>

            <div className="payment-method">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input type="radio" name="payment" defaultChecked />
                  <span>Cash on Delivery</span>
                </label>
                <label className="payment-option">
                  <input type="radio" name="payment" />
                  <span>Online Payment (E-sewa)</span>
                  <img
                    src="https://esewa.com.np/common/images/esewa_logo.png"
                    alt="esewa"
                    className="payment-logo"
                  />
                </label>
                <label className="payment-option">
                  <input type="radio" name="payment" />
                  <span>Online Payment (Khalti)</span>
                </label>
              </div>
            </div>

            <button className="place-order-btn">Place Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
