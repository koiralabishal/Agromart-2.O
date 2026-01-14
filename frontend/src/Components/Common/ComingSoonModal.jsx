import React from "react";
import { FaClock, FaTimes } from "react-icons/fa";
import "./Styles/ComingSoonModal.css";

const ComingSoonModal = ({ isOpen, onClose, featureName = "This feature" }) => {
  if (!isOpen) return null;

  return (
    <div className="coming-soon-modal-overlay">
      <div className="coming-soon-modal-content">
        <button className="close-modal-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="coming-soon-icon-wrapper">
          <FaClock className="coming-soon-icon" />
        </div>
        <h2>Coming Soon!</h2>
        <p>
          We are working hard to bring you <strong>{featureName}</strong>.
          Please stay tuned for updates!
        </p>
        <button className="coming-soon-ack-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
};

export default ComingSoonModal;
