import React, { useState } from "react";
import {
  FaArrowLeft,
  FaDownload,
  FaPhoneAlt,
  FaChevronDown,
  FaCheckCircle,
  FaBox,
  FaClipboardList,
  FaArchive,
  FaTimesCircle,
} from "react-icons/fa";
import "./Styles/BuyerOrderDetailView.css";

// Import local assets
import cauliflowerImg from "../../../assets/products/cauliflower.jpeg";
import broccoliImg from "../../../assets/products/broccoli.jpeg";

const BuyerOrderDetailView = ({ onBack, order, orderType = "placed" }) => {
  const [currentStatus, setCurrentStatus] = useState(order?.status || "Pending");
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Use passed order data or fallback to mock
  const orderDetails = {
    id: order?.id || "ORD-2024-001",
    summary: {
      orderId: order?.id || "ORD-2024-001",
      orderDateTime: order?.date ? new Date(order.date).toLocaleString() : "October 26, 2023, 10:30 AM",
      paymentStatus: "Paid",
      paymentChannel: "Esewa",
    },
    party: {
      name: order?.distributor || "Prime Distribution Co.",
      businessName: "Prime Distribution Center",
      contact: "+977 9800000000",
      address: "Biratnagar, Nepal",
      esewaId: "9800000000",
    },
    delivery: {
      address: "123 Green Lane, Agroville, Nepal",
      partner: "AgroLogistics Express",
    },
    items: [
      {
        id: 1,
        name: "Fresh Red Tomatoes",
        category: "Vegetable",
        quantity: "50 kg",
        unitPrice: "Rs. 120/kg",
        total: "Rs. 6,000",
        image: cauliflowerImg,
      },
      {
        id: 2,
        name: "Organic Potatoes",
        category: "Vegetable",
        quantity: "30 kg",
        unitPrice: "Rs. 60/kg",
        total: "Rs. 1,800",
        image: broccoliImg,
      },
    ],
    pricing: {
      subtotal: "Rs. 7,800",
      deliveryFee: "Rs. 500",
      discount: "-Rs. 200",
      finalTotal: order?.total ? `Rs. ${order.total}` : "Rs. 8,100",
    },
  };

  return (
    <div className="order-detail-view">
      <div className="odv-header">
        <div className="odv-header-left">
          <FaArrowLeft
            className="back-arrow-icon"
            onClick={onBack}
            title="Back to Orders"
          />
          <h2>Order {orderDetails.id}</h2>

          <div
            className={`odv-status-badge status-${currentStatus.toLowerCase()}`}
          >
            {currentStatus}
          </div>
        </div>
        <button className="download-invoice-btn">
          <FaDownload /> Download Invoice
        </button>
      </div>

      <div className="odv-main-content">
        <div className="odv-row">
          <div className="odv-left-col">
            <section className="odv-card">
              <h3>Order Summary</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span className="label">Order ID</span>
                  <span className="value bold">
                    {orderDetails.summary.orderId}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Date & Time</span>
                  <span className="value">
                    {orderDetails.summary.orderDateTime}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Payment Status</span>
                  <span className="value bold">
                    {orderDetails.summary.paymentStatus}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Payment Channel</span>
                  <span className="value bold">
                    {orderDetails.summary.paymentChannel}
                  </span>
                </div>
              </div>
            </section>
          </div>
          <div className="odv-right-col">
            <section className="odv-card items-card">
              <h3>Ordered Items</h3>
              <div className="odv-table-wrapper scrollable-table">
                <table className="odv-items-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="odv-item-thumbnail"
                          />
                        </td>
                        <td className="bold">{item.name}</td>
                        <td>{item.category}</td>
                        <td className="bold">{item.quantity}</td>
                        <td>{item.unitPrice}</td>
                        <td className="bold total-price-col">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <div className="odv-row">
          <div className="odv-left-col">
            <section className="odv-card">
              <h3>Distributor Details</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span className="label">Name</span>
                  <span className="value bold">{orderDetails.party.name}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Business</span>
                  <span className="value bold">
                    {orderDetails.party.businessName}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Contact</span>
                  <span className="value phone-link">
                    <FaPhoneAlt size={12} /> {orderDetails.party.contact}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Address</span>
                  <span className="value bold">
                    {orderDetails.party.address}
                  </span>
                </div>
              </div>
            </section>
          </div>
          <div className="odv-right-col">
            <section className="odv-card pricing-card">
              <h3>Price Breakdown</h3>
              <div className="pricing-list">
                <div className="pricing-row">
                  <span>Subtotal</span>
                  <span className="bold">{orderDetails.pricing.subtotal}</span>
                </div>
                <div className="pricing-row">
                  <span>Delivery Fee</span>
                  <span className="bold">
                    {orderDetails.pricing.deliveryFee}
                  </span>
                </div>
                <div className="pricing-row discount">
                  <span>Discount</span>
                  <span className="bold red-text">
                    {orderDetails.pricing.discount}
                  </span>
                </div>
                <div className="pricing-divider"></div>
                <div className="pricing-final">
                  <span>Final Payable Amount</span>
                  <span className="final-amount">
                    {orderDetails.pricing.finalTotal}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="odv-row">
          <div className="odv-left-col">
            <section className="odv-card">
              <h3>Delivery Information</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span className="label">Address</span>
                  <span className="value bold address-val">
                    {orderDetails.delivery.address}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Partner</span>
                  <span className="value bold">
                    {orderDetails.delivery.partner}
                  </span>
                </div>
              </div>
            </section>
          </div>
          <div className="odv-right-col">
            <section className="odv-card tracking-card">
              <h3>Order Status Tracker</h3>
              <div className="tracking-stepper">
                <div className="track-step completed">
                  <div className="track-checkpoint">
                    <div className="checkpoint-icon">
                      <FaClipboardList />
                    </div>
                    <div className="track-line line-completed"></div>
                  </div>
                  <div className="track-info">
                    <span className="track-title">Order Placed</span>
                  </div>
                </div>
                <div
                  className={`track-step ${
                    currentStatus !== "Pending" ? "completed" : "active"
                  }`}
                >
                  <div className="track-checkpoint">
                    <div className="checkpoint-icon">
                      {currentStatus === "Rejected" ? (
                        <FaTimesCircle />
                      ) : (
                        <FaCheckCircle />
                      )}
                    </div>
                    <div
                      className={`track-line ${
                        ["Processing", "Delivered", "Completed"].includes(currentStatus)
                          ? "line-completed"
                          : currentStatus === "Accepted"
                          ? "line-active"
                          : ""
                      }`}
                    ></div>
                  </div>
                  <div className="track-info">
                    <span className="track-title">
                      {currentStatus === "Rejected"
                        ? "Order Rejected"
                        : "Accepted"}
                    </span>
                  </div>
                </div>
                {/* Processing Step */}
                <div
                  className={`track-step ${
                    ["Processing", "Delivered", "Completed"].includes(currentStatus)
                      ? "completed"
                      : currentStatus === "Accepted"
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="track-checkpoint">
                    <div className="checkpoint-icon">
                      <FaBox />
                    </div>
                    <div
                      className={`track-line ${
                        ["Delivered", "Completed"].includes(currentStatus) ? "line-completed" : ""
                      }`}
                    ></div>
                  </div>
                  <div className="track-info">
                    <span className="track-title">Processing</span>
                  </div>
                </div>
                {/* Delivered Step */}
                <div
                  className={`track-step ${
                    ["Delivered", "Completed"].includes(currentStatus)
                      ? "completed"
                      : currentStatus === "Processing"
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="track-checkpoint">
                    <div className="checkpoint-icon">
                      <FaArchive />
                    </div>
                  </div>
                  <div className="track-info">
                    <span className="track-title">Delivered</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerOrderDetailView;
