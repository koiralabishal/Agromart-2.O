import React from "react";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaShoppingCart,
} from "react-icons/fa";
import "./Styles/CartView.css";

import api from "../../../api/axiosConfig";
import OrderSuccessModal from "../../Common/OrderSuccessModal";
import ComingSoonModal from "../../Common/ComingSoonModal";

const CartView = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onBack,
  onClearCart,
  onOrderComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = React.useState("COD");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showComingSoon, setShowComingSoon] = React.useState(false);

  // Group items by distributor for clearer organization
  const groupedItems = React.useMemo(() => {
    const groups = {};
    cartItems.forEach((item) => {
      let distributorId, distributorName;

      if (item.userID && typeof item.userID === "object") {
        distributorId = item.userID._id || item.userID.id;
        distributorName = item.userID.name;
      } else {
        distributorId = item.userID || "unknown";
        distributorName = item.distributorName || "Selected Distributor";
      }

      if (!groups[distributorId]) {
        groups[distributorId] = {
          distributorId,
          distributorName,
          items: [],
        };
      }
      groups[distributorId].items.push(item);
    });
    return Object.values(groups);
  }, [cartItems]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  
  // Rs. 100 delivery charge per order (per seller/distributor)
  const deliveryChargePerOrder = 100;
  const numberOfOrders = groupedItems.length; // Each seller = 1 order
  const deliveryCharge = numberOfOrders * deliveryChargePerOrder;
  const grandTotal = subtotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === "COD") {
        const user = JSON.parse(localStorage.getItem("user"));
        const userID = user?._id || user?.id;

        await api.post("/orders/create", {
          cartItems,
          paymentMethod: "COD",
          userID,
          totalAmount: grandTotal,
        });
        setShowSuccessModal(true);
        return;
      }

      if (paymentMethod === "eSewa") {
        const user = JSON.parse(localStorage.getItem("user"));
        const userID = user?._id || user?.id;

        const response = await api.post("/orders/initiate", {
          totalAmount: grandTotal,
          cartItems,
          userID,
        });

        const { paymentParams } = response.data;
        
        // Store transaction UUID for failure handling
        sessionStorage.setItem("transactionUUID", paymentParams.transaction_uuid);

        // Auto-submit hidden form for eSewa
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", paymentParams.url); // Production/Test URL

        for (const key in paymentParams) {
          if (key === "url") continue;
          const hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", paymentParams[key]);
          form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
      }

      if (paymentMethod === "Khalti") {
        setShowComingSoon(true);
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      if (paymentMethod !== "COD") setIsProcessing(false);
      if (paymentMethod === "COD") setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    onClearCart && onClearCart();
    onOrderComplete && onOrderComplete();
  };


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
      <OrderSuccessModal isOpen={showSuccessModal} onClose={handleCloseModal} />
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        featureName="Khalti Payment Integration"
      />
      <div className="cart-header-row">
        <button className="back-btn-cart" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
        <h1>Your Shopping Cart</h1>
        <div style={{ width: "80px" }}></div> {/* Spacer for centering */}
      </div>

      <div className="cart-content-grid">
        {/* Left Side: Items Grouped by Distributor */}
        <div className="cart-items-section">
          {groupedItems.map((group) => (
            <div key={group.distributorId} className="farmer-group-container">
              <div className="farmer-group-header">
                <div className="farmer-info-badge">
                  <span className="farmer-label">DISTRIBUTOR</span>
                  <span className="farmer-name">{group.distributorName}</span>
                </div>
                <div className="group-item-count">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "item" : "items"}
                </div>
              </div>

              <div className="cart-items-list">
                {group.items.map((item) => {
                  const itemId = item._id || item.id;
                  const itemName = item.productName || item.name;
                  const itemImg = item.productImage || item.image;

                  return (
                    <div key={itemId} className="cart-item-card">
                      <div className="item-image">
                        <img
                          src={
                            itemImg ||
                            "https://via.placeholder.com/100?text=Product"
                          }
                          alt={itemName}
                        />
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
          ))}
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
              <span>Delivery Charge ({numberOfOrders} {numberOfOrders === 1 ? 'order' : 'orders'} × Rs. {deliveryChargePerOrder})</span>
              <span>Rs. {deliveryCharge.toFixed(2)}</span>
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
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="eSewa"
                    checked={paymentMethod === "eSewa"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Online Payment (E-sewa)</span>
                  <img
                    src="https://esewa.com.np/common/images/esewa_logo.png"
                    alt="esewa"
                    className="payment-logo"
                  />
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="Khalti"
                    checked={paymentMethod === "Khalti"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Online Payment (Khalti)</span>
                  <img
                    src="https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-original-577x577/s3/102020/khalti_logo.png?itok=AtjU-A3U"
                    alt="Khalti"
                    className="payment-logo"
                    style={{ height: "20px", marginLeft: "auto" }}
                  />
                </label>
              </div>
            </div>

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
