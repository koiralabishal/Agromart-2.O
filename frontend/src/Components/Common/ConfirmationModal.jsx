import React from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmBtnText,
}) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3
          style={{
            fontSize: "1.25rem",
            marginBottom: "1rem",
            color: type === "danger" ? "#EF4444" : "#1F2937",
          }}
        >
          {title}
        </h3>
        <p style={{ color: "#4B5563", marginBottom: "1.5rem" }}>{message}</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.6rem 1.2rem",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "0.6rem 1.2rem",
              border: "none",
              borderRadius: "6px",
              background: type === "danger" ? "#EF4444" : "#1DC956",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {confirmBtnText ||
              (type === "danger" ? "Yes, Reject" : "Yes, Approve")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
