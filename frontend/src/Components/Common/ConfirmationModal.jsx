import React from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import "./Styles/ConfirmationModal.css";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  orderID,
  confirmText = "Yes",
  cancelText = "No",
  type = "warning", // warning, danger
}) => {
  if (!isOpen) return null;

  return (
    <div className="conf-modal-overlay">
      <div className={`conf-modal-card ${type}`}>
        <button className="conf-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="conf-modal-icon-container">
          <FaExclamationTriangle className="conf-modal-icon" />
        </div>

        <div className="conf-modal-content">
          <h2>{title}</h2>
          <p className="conf-modal-msg">{message}</p>
          {orderID && (
            <div className="conf-modal-order-id">
              <span>Order ID:</span>
              <strong>{orderID}</strong>
            </div>
          )}
        </div>

        <div className="conf-modal-actions">
          <button className="conf-btn cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="conf-btn confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
