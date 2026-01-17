import React from "react";
import { FaTimes, FaBoxOpen, FaTruck, FaMoneyBillWave } from "react-icons/fa";
import "./OrderDetailModal.css";

const OrderDetailModal = ({ isOpen, onClose, order, viewContext }) => {
  if (!isOpen || !order) return null;

  const deliveryCharge = order.deliveryCharge || 100;
  const subtotal = order.totalAmount - deliveryCharge;

  return (
    <div className="od-overlay">
      <div className="od-modal">
        {/* Header */}
        <div className="od-header">
          <h2 className="od-title">Order Details</h2>
          <button onClick={onClose} className="od-close-btn">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="od-body">
          {/* Info Grid */}
          <div className="od-info-grid">
            <div className="od-info-item">
              <h4>Order ID</h4>
              <p>{order.orderID}</p>
            </div>
            <div className="od-info-item">
              <h4>{viewContext === "placed" ? "Seller" : "Buyer"}</h4>
              <p>
                {viewContext === "placed"
                  ? order.sellerID?.name || "N/A"
                  : order.buyerID?.name || "N/A"}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginTop: "2px",
                }}
              >
                {viewContext === "placed"
                  ? order.sellerID?.email
                  : order.buyerID?.email}
              </p>
            </div>
            <div className="od-info-item">
              <h4>Status</h4>
              <p
                style={{
                  color:
                    order.status === "Delivered"
                      ? "#10b981"
                      : order.status === "Canceled"
                        ? "#ef4444"
                        : "#f59e0b",
                }}
              >
                {order.status}
              </p>
            </div>
            <div className="od-info-item">
              <h4>Payment</h4>
              <p>
                {order.paymentMethod}
                <span
                  style={{
                    fontSize: "0.8em",
                    marginLeft: "5px",
                    color: order.paymentStatus === "Paid" ? "green" : "orange",
                  }}
                >
                  ({order.paymentStatus})
                </span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <h4 style={{ marginBottom: "1rem", color: "#374151" }}>Items</h4>
          <div className="od-items-container">
            <table className="od-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <img
                          src={item.image || "https://placehold.co/40"}
                          alt={item.productName}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                        <span className="od-item-name">{item.productName}</span>
                      </div>
                    </td>
                    <td>
                      {item.quantity} {item.unit}
                    </td>
                    <td>Rs. {item.price}</td>
                    <td>Rs. {item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="od-summary">
            <div className="od-summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal}</span>
            </div>
            <div className="od-summary-row">
              <span
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <FaTruck size={14} /> Delivery Charge
              </span>
              <span>Rs. {deliveryCharge}</span>
            </div>
            <div className="od-summary-row total">
              <span>Grand Total</span>
              <span>Rs. {order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
