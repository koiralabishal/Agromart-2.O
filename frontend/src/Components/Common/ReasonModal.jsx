import React, { useState } from "react";

const ReasonModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please enter a reason");
      return;
    }
    onConfirm(reason);
    setReason("");
  };

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
          maxWidth: "450px",
          width: "90%",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3
          style={{
            fontSize: "1.25rem",
            marginBottom: "0.5rem",
            color: "#1F2937",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: "#4B5563",
            marginBottom: "1.5rem",
            fontSize: "0.95rem",
          }}
        >
          {message}
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason here..."
            style={{
              width: "100%",
              height: "120px",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #D1D5DB",
              marginBottom: "1.5rem",
              fontSize: "1rem",
              fontFamily: "inherit",
              resize: "none",
              outline: "none",
            }}
          />

          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.6rem 1.5rem",
                border: "1px solid #D1D5DB",
                borderRadius: "6px",
                background: "white",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "0.6rem 1.5rem",
                border: "none",
                borderRadius: "6px",
                background: "#EF4444",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReasonModal;
