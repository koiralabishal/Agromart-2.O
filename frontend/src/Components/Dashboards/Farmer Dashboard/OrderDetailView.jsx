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

// Import images from assets to match item table
import tomatoImg from "../../../assets/products/cauliflower.jpeg"; // placeholder
import appleImg from "../../../assets/products/apple-fruit.jpg";
import spinachImg from "../../../assets/products/broccoli.jpeg"; // placeholder
import carrotImg from "../../../assets/products/cabbage.jpeg"; // placeholder

const OrderDetailView = ({ onBack }) => {
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
    if (currentStatus === "Rejected") return true; // Terminal state

    const hierarchy = {
      Pending: 0,
      Accepted: 1,
      Shipping: 2,
      Completed: 3,
      Rejected: -1, // Special case
    };

    const currentIdx = hierarchy[currentStatus];
    const targetIdx = hierarchy[status];

    // Can't go back to Pending
    if (status === "Pending" && currentStatus !== "Pending") return true;

    // Can't go to Rejected once Accepted/Shipping/Completed
    if (status === "Rejected" && currentIdx >= 1) return true;

    // Can't go backwards in the main flow
    if (targetIdx !== -1 && targetIdx < currentIdx) return true;

    return false;
  };

  const orderDetails = {
    id: "AGRM-789012345",
    summary: {
      orderId: "AGRM-789012345",
      orderDateTime: "October 26, 2023, 10:30 AM",
      paymentStatus: "Paid",
      paymentChannel: "Esewa",
    },
    collector: {
      name: "Green Harvest Co.",
      businessName: "Central Fresh Produce Market",
      contact: "+1 (555) 123-4567",
      address: "123 Farm Lane, Rural Town, AG",
      esewaId: "9800000000",
    },
    delivery: {
      address: "456 Urban Street, Apt 7B, Cityville, NY 10001",
      partner: "AgroLogistics Express",
    },
    items: [
      {
        id: 1,
        name: "Organic Red Tomatoes",
        category: "Vegetable",
        grade: "A",
        quantity: "200 kg",
        unitPrice: "$1.50/kg",
        total: "$300.00",
        image: tomatoImg,
      },
      {
        id: 2,
        name: "Granny Smith Apples",
        category: "Fruit",
        grade: "B",
        quantity: "50 crates",
        unitPrice: "$15.00/crate",
        total: "$750.00",
        image: appleImg,
      },
      {
        id: 3,
        name: "Fresh Spinach",
        category: "Vegetable",
        grade: "A",
        quantity: "80 bundles",
        unitPrice: "$2.00/bundle",
        total: "$160.00",
        image: spinachImg,
      },
      {
        id: 4,
        name: "Organic Carrots",
        category: "Vegetable",
        grade: "A",
        quantity: "120 kg",
        unitPrice: "$0.80/kg",
        total: "$96.00",
        image: carrotImg,
      },
      {
        id: 5,
        name: "Fresh Cauliflower",
        category: "Vegetable",
        grade: "A",
        quantity: "50 kg",
        unitPrice: "$1.20/kg",
        total: "$60.00",
        image: tomatoImg,
      },
    ],
    pricing: {
      subtotal: "$1,366.00",
      deliveryFee: "$20.00",
      discount: "-$10.55",
      finalTotal: "$1,375.45",
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

          <div className="odv-status-dropdown-container">
            <div
              className={`odv-status-badge interactable status-${currentStatus.toLowerCase()} ${
                currentStatus === "Rejected" ? "disabled" : ""
              }`}
              onClick={() =>
                currentStatus !== "Rejected" && setIsStatusOpen(!isStatusOpen)
              }
            >
              {currentStatus}{" "}
              {currentStatus !== "Rejected" && <FaChevronDown size={10} />}
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
        </div>
        <button className="download-invoice-btn">
          <FaDownload /> Download Invoice
        </button>
      </div>

      <div className="odv-main-content">
        {/* ROW 1: Summary and Items */}
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
                  <span className="label">Order Date & Time</span>
                  <span className="value">
                    {orderDetails.summary.orderDateTime}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Order Status</span>
                  <span
                    className={`odv-status-pill status-${currentStatus.toLowerCase()}`}
                  >
                    {currentStatus}
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

        {/* ROW 2: Collector and Price */}
        <div className="odv-row">
          <div className="odv-left-col">
            <section className="odv-card">
              <h3>Collectors Details</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span className="label">Name</span>
                  <span className="value bold">
                    {orderDetails.collector.name}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Business Name</span>
                  <span className="value bold">
                    {orderDetails.collector.businessName}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Contact Number</span>
                  <span className="value phone-link">
                    <FaPhoneAlt size={12} /> {orderDetails.collector.contact}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Address</span>
                  <span className="value bold">
                    {orderDetails.collector.address}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">E-sewa/ Khalti ID:</span>
                  <span className="value phone-link green-text">
                    {orderDetails.collector.esewaId}
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

        {/* ROW 3: Delivery Information and Order Status */}
        <div className="odv-row">
          <div className="odv-left-col">
            <section className="odv-card">
              <h3>Delivery Information</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span className="label">Delivery Address</span>
                  <span className="value bold address-val">
                    {orderDetails.delivery.address}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Delivery Partner Name</span>
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
                {/* Step 1: Order Placed (Always completed if we are here) */}
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

                {/* Step 2: Accepted / Rejected */}
                <div 
                  className={`track-step ${
                    currentStatus === "Shipping" || currentStatus === "Completed" ? "completed" : 
                    currentStatus === "Rejected" ? "rejected" : 
                    currentStatus === "Pending" || currentStatus === "Accepted" ? "active" : ""
                  }`}
                >
                  <div className="track-checkpoint">
                    <div className="checkpoint-icon">
                      {currentStatus === "Rejected" ? <FaTimesCircle /> : <FaCheckCircle />}
                    </div>
                    <div className={`track-line ${
                      currentStatus === "Shipping" || currentStatus === "Completed" ? "line-completed" : 
                      currentStatus === "Accepted" ? "line-active" : ""
                    }`}></div>
                  </div>
                  <div className="track-info">
                    <span className="track-title">
                      {currentStatus === "Rejected" ? "Order Rejected" : "Accepted"}
                    </span>
                  </div>
                </div>

                {/* Step 3: Packed / Ready */}
                <div 
                  className={`track-step ${
                    currentStatus === "Shipping" || currentStatus === "Completed" ? "completed" : 
                    currentStatus === "Accepted" ? "active" : ""
                  }`}
                >
                  <div className="track-checkpoint">
                    <div className="checkpoint-icon">
                      <FaBox />
                    </div>
                    <div className={`track-line ${
                      currentStatus === "Shipping" || currentStatus === "Completed" ? "line-completed" : ""
                    }`}></div>
                  </div>
                  <div className="track-info">
                    <span className="track-title">Ready for Pickup</span>
                  </div>
                </div>

                {/* Step 4: Completed */}
                <div 
                  className={`track-step ${
                    currentStatus === "Completed" ? "completed" : 
                    currentStatus === "Shipping" ? "active" : ""
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
