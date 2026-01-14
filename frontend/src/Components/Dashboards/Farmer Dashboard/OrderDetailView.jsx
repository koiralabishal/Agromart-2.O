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

import api from "../../../api/axiosConfig";
import ConfirmationModal from "../../Common/ConfirmationModal";

const OrderDetailView = ({ order, onBack, onOrderUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(
    order?.status || "Pending"
  );
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [confModal, setConfModal] = useState({
    isOpen: false,
    newStatus: "",
    type: "warning",
    title: "",
    message: "",
  });

  if (!order) return <div className="order-detail-view">Loading...</div>;

  const statusOptions = [
    "Pending",
    "Accepted",
    "Processing",
    "Shipping",
    "Delivered",
    "Rejected",
  ];

  const getDisabledStatus = (status) => {
    if (currentStatus === "Canceled" || currentStatus === "Delivered" || currentStatus === "Rejected")
      return true; // Terminal states

    const hierarchy = {
      Pending: 0,
      Accepted: 1,
      Processing: 2,
      Shipping: 3,
      Delivered: 4,
      Canceled: -1,
      Rejected: -2,
    };

    const currentIdx = hierarchy[currentStatus] || 0;
    const targetIdx = hierarchy[status];

    // Rejected is only allowed from Pending
    if (status === "Rejected") {
      return currentStatus !== "Pending";
    }

    // Canceled is allowed from Pending or Accepted
    if (status === "Canceled") {
      return currentIdx > 1; // Only allow cancellation before Processing
    }

    // Sequence: Can only move to the NEXT step
    if (targetIdx === currentIdx + 1) return false;

    return true; // Everything else is disabled
  };

  const handleStatusChange = async (status) => {
    if (getDisabledStatus(status)) return;

    if (status === "Canceled" || status === "Rejected") {
      setConfModal({
        isOpen: true,
        newStatus: status,
        type: "danger",
        title: `${status} Order`,
        message: `Are you sure you want to ${status.toLowerCase()} this order? This action cannot be undone.`,
      });
      return;
    }

    await proceedWithStatusUpdate(status);
  };

  const proceedWithStatusUpdate = async (status) => {
    try {
      await api.put(`/orders/${order._id}/status`, { status });
      setCurrentStatus(status);
      setIsStatusOpen(false);

      // Update Parent State (For persistence)
      if (onOrderUpdate) {
        onOrderUpdate({ ...order, status });
      }

      // Update Cache (Optimistic / Consistency update) - Farmers only receive orders
      const cachedOrders = sessionStorage.getItem("farmerOrdersReceived");
      if (cachedOrders) {
        const orders = JSON.parse(cachedOrders);
        const updatedOrders = orders.map((o) =>
          o._id === order._id ? { ...o, status: status } : o
        );
        sessionStorage.setItem(
          "farmerOrdersReceived",
          JSON.stringify(updatedOrders)
        );
      }
      const savedOrderDetail = sessionStorage.getItem("selectedOrder");
      if (savedOrderDetail) {
        const orderObj = JSON.parse(savedOrderDetail);
        if (orderObj._id === order._id) {
          orderObj.status = status;
          sessionStorage.setItem("selectedOrder", JSON.stringify(orderObj));
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // Map real order data
  const buyer = order.buyerID;
  const buyerName = buyer?.name || "Unknown Buyer";
  const buyerBusiness = buyer?.businessName || buyer?.name || "N/A";
  const buyerPhone = buyer?.phone || "N/A";
  const buyerAddress = buyer?.address || "N/A";

  // Seller (Farmer) data
  const seller = order.sellerID;
  const sellerName = seller?.name || "Unknown Seller";
  const sellerBusiness = seller?.businessName || seller?.name || "N/A";
  const sellerPhone = seller?.phone || "N/A";
  const sellerAddress = seller?.address || "N/A";

  const orderDate = new Date(order.createdAt).toLocaleString();
  const deliveryAddress = buyer?.address || "N/A";

  // Price calculations
  const subtotal = order.products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const deliveryFee = 5.0;
  const discount = 0;
  const finalTotal = order.totalAmount;

  return (
    <div className="order-detail-view">
      <div className="odv-header">
        <div className="odv-header-left">
          <FaArrowLeft
            className="back-arrow-icon"
            onClick={onBack}
            title="Back to Orders"
          />
          <h2>Order {order.orderID}</h2>

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
              {currentStatus !== "Delivered" && currentStatus !== "Canceled" && <FaChevronDown size={10} />}
            </div>
            {isStatusOpen && (
              <div className="odv-status-options">
                {statusOptions.map((opt) => {
                  const isDisabled = getDisabledStatus(opt);
                  if (isDisabled && opt !== currentStatus) return null; // Only show current or valid next
                  return (
                    <div
                      key={opt}
                      className={`status-option ${isDisabled ? "disabled" : ""}`}
                      onClick={() => !isDisabled && handleStatusChange(opt)}
                    >
                      {opt}
                    </div>
                  );
                })}
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
                  <span className="value bold">{order.orderID}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Order Date & Time</span>
                  <span className="value">{orderDate}</span>
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
                  <span className="value bold">{order.paymentStatus}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Payment Channel</span>
                  <span className="value bold">{order.paymentMethod}</span>
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
                    {order.products.map((item, idx) => (
                      <tr key={item.productID || idx}>
                        <td>
                          <img
                            src={
                              item.image ||
                              "https://via.placeholder.com/50?text=Product"
                            }
                            alt={item.productName}
                            className="odv-item-thumbnail"
                          />
                        </td>
                        <td className="bold">{item.productName}</td>
                        <td>{item.category || "N/A"}</td>
                        <td className="bold">{item.quantity}</td>
                        <td>Rs. {item.price.toFixed(2)}</td>
                        <td className="bold total-price-col">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </td>
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
              <h3>Buyer Details</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span className="label">Name</span>
                  <span className="value bold">{buyerName}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Business</span>
                  <span className="value bold">{buyerBusiness}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Email</span>
                  <span className="value bold">{buyer?.email || "N/A"}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Contact</span>
                  <span className="value phone-link">
                    <FaPhoneAlt size={12} /> {buyerPhone}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Address</span>
                  <span className="value bold">{buyerAddress}</span>
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
                  <span className="bold">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="pricing-row">
                  <span>Delivery Fee</span>
                  <span className="bold">Rs. {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pricing-row discount">
                  <span>Discount</span>
                  <span className="bold red-text">
                    -Rs. {discount.toFixed(2)}
                  </span>
                </div>
                <div className="pricing-divider"></div>
                <div className="pricing-final">
                  <span>Final Payable Amount</span>
                  <span className="final-amount">
                    Rs. {Number(finalTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ROW 3: Seller Information and Order Status */}
        <div className="odv-row">
          <div className="odv-left-col">
            <section className="odv-card">
              <h3>Seller Information (Your Details)</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span className="label">Name</span>
                  <span className="value bold">{sellerName}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Business</span>
                  <span className="value bold">{sellerBusiness}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Email</span>
                  <span className="value bold">{seller?.email || "N/A"}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Contact</span>
                  <span className="value phone-link">
                    <FaPhoneAlt size={12} /> {sellerPhone}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Address</span>
                  <span className="value bold">{sellerAddress}</span>
                </div>
              </div>
            </section>
          </div>
          {/* <div className="odv-left-col">
            <section className="odv-card">
              <h3>Buyer Contact Details</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span className="label">Email</span>
                  <span className="value bold">{buyer?.email || "N/A"}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Phone</span>
                  <span className="value phone-link">
                    <FaPhoneAlt size={12} /> {buyerPhone}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Delivery Address</span>
                  <span className="value bold address-val">
                    {deliveryAddress}
                  </span>
                </div>
              </div>
            </section>
          </div> */}
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

                {currentStatus === "Canceled" || currentStatus === "Rejected" ? (
                  <div className="track-step rejected">
                    <div className="track-checkpoint">
                      <div className="checkpoint-icon">
                        <FaTimesCircle />
                      </div>
                    </div>
                    <div className="track-info">
                      <span className="track-title">
                        Order {currentStatus}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Step 2: Accepted */}
                    <div
                      className={`track-step ${
                        ["Accepted", "Processing", "Shipping", "Delivered"].includes(currentStatus)
                          ? "completed"
                          : currentStatus === "Pending"
                          ? "active"
                          : ""
                      }`}
                    >
                      <div className="track-checkpoint">
                        <div className="checkpoint-icon">
                          <FaCheckCircle />
                        </div>
                        <div
                          className={`track-line ${
                            ["Processing", "Shipping", "Delivered"].includes(currentStatus)
                              ? "line-completed"
                              : currentStatus === "Accepted"
                              ? "line-active"
                              : ""
                          }`}
                        ></div>
                      </div>
                      <div className="track-info">
                        <span className="track-title">Accepted</span>
                      </div>
                    </div>

                    {/* Step 3: Processing */}
                    <div
                      className={`track-step ${
                        ["Processing", "Shipping", "Delivered"].includes(currentStatus)
                          ? "completed"
                          : currentStatus === "Accepted"
                          ? "active"
                          : ""
                      }`}
                    >
                      <div className="track-checkpoint">
                        <div className="checkpoint-icon">
                          <FaArchive />
                        </div>
                        <div
                          className={`track-line ${
                            ["Shipping", "Delivered"].includes(currentStatus)
                              ? "line-completed"
                              : currentStatus === "Processing"
                              ? "line-active"
                              : ""
                          }`}
                        ></div>
                      </div>
                      <div className="track-info">
                        <span className="track-title">Processing</span>
                      </div>
                    </div>

                    {/* Step 4: Shipping */}
                    <div
                      className={`track-step ${
                        ["Shipping", "Delivered"].includes(currentStatus)
                          ? "completed"
                          : currentStatus === "Processing"
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
                            currentStatus === "Delivered"
                              ? "line-completed"
                              : currentStatus === "Shipping"
                              ? "line-active"
                              : ""
                          }`}
                        ></div>
                      </div>
                      <div className="track-info">
                        <span className="track-title">Shipping</span>
                      </div>
                    </div>

                    {/* Step 5: Delivered */}
                    <div
                      className={`track-step ${
                        currentStatus === "Delivered"
                          ? "completed"
                          : currentStatus === "Shipping"
                          ? "active"
                          : ""
                      }`}
                    >
                      <div className="track-checkpoint">
                        <div className="checkpoint-icon">
                          <FaCheckCircle />
                        </div>
                      </div>
                      <div className="track-info">
                        <span className="track-title">Delivered</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confModal.isOpen}
        onClose={() => setConfModal({ ...confModal, isOpen: false })}
        onConfirm={() => {
          proceedWithStatusUpdate(confModal.newStatus);
          setConfModal({ ...confModal, isOpen: false });
        }}
        title={confModal.title}
        message={confModal.message}
        orderID={order.orderID}
        type={confModal.type}
        confirmText={`Yes, ${confModal.newStatus}`}
        cancelText="No, Keep"
      />
    </div>
  );
};

export default OrderDetailView;
