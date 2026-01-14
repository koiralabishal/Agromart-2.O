import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import "./Styles/OrderSuccessModal.css";

const OrderSuccessModal = ({
  isOpen,
  onClose,
  title = "Order Placed Successfully!",
  message = "Your order has been received and will be processed shortly.",
  showPaymentNote = true,
  paymentMethod = "Cash on Delivery",
}) => {
  if (!isOpen) return null;

  return (
    <div className="order-success-modal-overlay">
      <div className="order-success-card">
        <div className="success-icon-container">
          <FaCheckCircle className="success-icon" />
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        {showPaymentNote && (
          <p className="payment-note">
            Payment Method: <strong>{paymentMethod}</strong>
          </p>
        )}
        <button className="success-ok-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
