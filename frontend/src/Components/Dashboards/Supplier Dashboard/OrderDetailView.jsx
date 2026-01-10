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
import "./Styles/OrderDetailView.css";

// Import local assets
import cauliflowerImg from "../../../assets/products/cauliflower.jpeg";
import broccoliImg from "../../../assets/products/broccoli.jpeg";

const OrderDetailView = ({ onBack, orderType = "received" }) => {
  const [currentStatus, setCurrentStatus] = useState("Pending");
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const statusOptions = [
    "Pending",
    "Accepted",
    "Shipping",
    "Completed",
    "Rejected",
  ];

  const getDisabledStatus = (status) => {
    if (currentStatus === "Rejected") return true;
    const hierarchy = {
      Pending: 0,
      Accepted: 1,
      Shipping: 2,
      Completed: 3,
      Rejected: -1,
    };
    const currentIdx = hierarchy[currentStatus];
    const targetIdx = hierarchy[status];
    if (status === "Pending" && currentStatus !== "Pending") return true;
    if (status === "Rejected" && currentIdx >= 1) return true;
    if (targetIdx !== -1 && targetIdx < currentIdx) return true;
    return false;
  };

  const orderDetails = {
    id: "AGRM-X12345",
    summary: {
      orderId: "AGRM-X12345",
      orderDateTime: "October 26, 2023, 10:30 AM",
      paymentStatus: "Paid",
      paymentChannel: "Esewa",
    },
    party: {
      name: orderType === "placed" ? "Sarah Chen" : "AgroDistributors Ltd.",
      businessName:
        orderType === "placed"
          ? "Golden Harvest Farms"
          : "Main Distribution Center",
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
        quantity: "200 kg",
        unitPrice: "Rs. 120/kg",
        total: "Rs. 24,000",
        image: cauliflowerImg,
      },
      {
        id: 2,
        name: "Organic Potatoes",
        category: "Vegetable",
        quantity: "150 kg",
        unitPrice: "Rs. 60/kg",
        total: "Rs. 9,000",
        image: broccoliImg,
      },
    ],
    pricing: {
      subtotal: "Rs. 33,000",
      deliveryFee: "Rs. 500",
      discount: "-Rs. 200",
      finalTotal: "Rs. 33,300",
    },
  };

  const handleStatusChange = (status) => {
    if (getDisabledStatus(status)) return;
    setCurrentStatus(status);
    setIsStatusOpen(false);
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

          {orderType === "received" && (
            <div className="odv-status-dropdown-container">
              <div
                className={`odv-status-badge interactable status-${currentStatus.toLowerCase()}`}
                onClick={() => setIsStatusOpen(!isStatusOpen)}
              >
                {currentStatus} <FaChevronDown size={10} />
              </div>
              {isStatusOpen && (
                <div className="odv-status-options">
                  {statusOptions.map((opt) => (
                    <div
                      key={opt}
                      className={`status-option ${
                        getDisabledStatus(opt) ? "disabled" : ""
                      }`}
                      onClick={() => handleStatusChange(opt)}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {orderType === "placed" && (
            <div
              className={`odv-status-badge status-${currentStatus.toLowerCase()}`}
            >
              {currentStatus}
            </div>
          )}
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
              <h3>
                {orderType === "placed"
                  ? "Farmer Details"
                  : "Distributor Details"}
              </h3>
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
                        ["Shipping", "Completed"].includes(currentStatus)
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
                <div
                  className={`track-step ${
                    ["Shipping", "Completed"].includes(currentStatus)
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
                        currentStatus === "Completed" ? "line-completed" : ""
                      }`}
                    ></div>
                  </div>
                  <div className="track-info">
                    <span className="track-title">Ready for Pickup</span>
                  </div>
                </div>
                <div
                  className={`track-step ${
                    currentStatus === "Completed"
                      ? "completed"
                      : currentStatus === "Shipping"
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
                    <span className="track-title">Completed</span>
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

export default OrderDetailView;
