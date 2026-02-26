import React, { useEffect } from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import "./Styles/ConfirmationModal.css"; // Reusing the same CSS for consistency

const VerificationWarningModal = ({ isOpen, onClose, message }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="conf-modal-overlay">
      <div className="conf-modal-card">
        <button className="conf-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="conf-modal-icon-container">
          <FaExclamationTriangle className="conf-modal-icon" />
        </div>
        <div className="conf-modal-content">
          <h2>Action Restricted</h2>
          <p className="conf-modal-msg">{message || "Your account must be verified by an admin to perform this action. Please wait for the verification process to complete."}</p>
        </div>
        <div className="conf-modal-actions">
          <button className="conf-btn confirm" onClick={onClose} style={{ width: "100%" }}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationWarningModal;
