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
import ConfirmationModal from "../../Common/ConfirmationModal";
import OrderSuccessModal from "../../Common/OrderSuccessModal";
import DisputeModal from "../../Common/DisputeModal";
import { FaExclamationCircle } from "react-icons/fa";
import { toast } from "react-toastify";

import api from "../../../api/axiosConfig";
import { generateInvoice } from "../../../utils/invoiceGenerator";

const BuyerOrderDetailView = ({
  onBack,
  order,
  orderType = "placed",
  onOrderUpdate,
}) => {
  const [currentStatus, setCurrentStatus] = useState(
    order?.status || "Pending",
  );
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Sync internal state with prop changes (for real-time socket updates)
  React.useEffect(() => {
    if (order?.status) {
      setCurrentStatus(order.status);
    }
  }, [order?.status]);
  const [confModal, setConfModal] = useState({
    isOpen: false,
    orderId: "",
    orderID_Display: "",
    newStatus: "",
    type: "warning",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isDisputeLoading, setIsDisputeLoading] = useState(false);

  if (!order) return <div className="order-detail-view">Loading...</div>;

  const statusOptions = [
    "Pending",
    "Accepted",
    "Processing",
    "Shipping",
    "Delivered",
    "Canceled",
    "Rejected",
  ];

  const getDisabledStatus = (status) => {
    return true; // Buyers cannot change status
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      if (newStatus === "Confirm Cash Paid") {
        await api.put(`/orders/${order._id}/confirm-payment`);
        if (onOrderUpdate) {
          onOrderUpdate(order._id, currentStatus, true); // true for payment update
        }

        // Update session storage for persistence
        const savedOrders = JSON.parse(
          sessionStorage.getItem("buyerOrdersPlaced") || "[]",
        );
        const updatedOrders = savedOrders.map((o) =>
          o._id === order._id ? { ...o, paymentStatus: "Paid" } : o,
        );
        sessionStorage.setItem(
          "buyerOrdersPlaced",
          JSON.stringify(updatedOrders),
        );

        const savedOrderDetail = sessionStorage.getItem("selectedOrder");
        if (savedOrderDetail) {
          const orderObj = JSON.parse(savedOrderDetail);
          if (orderObj._id === order._id) {
            orderObj.paymentStatus = "Paid";
            sessionStorage.setItem("selectedOrder", JSON.stringify(orderObj));
          }
        }
        setShowSuccess(true);
        return;
      }

      await api.put(`/orders/${order._id}/status`, { status: newStatus });
      setCurrentStatus(newStatus);
      if (onOrderUpdate) {
        onOrderUpdate(order._id, newStatus);
      }

      // Update session storage for persistence
      const savedOrders = JSON.parse(
        sessionStorage.getItem("buyerOrdersPlaced") || "[]",
      );
      const updatedOrders = savedOrders.map((o) =>
        o._id === order._id ? { ...o, status: newStatus } : o,
      );
      sessionStorage.setItem(
        "buyerOrdersPlaced",
        JSON.stringify(updatedOrders),
      );

      const savedOrderDetail = sessionStorage.getItem("selectedOrder");
      if (savedOrderDetail) {
        const orderObj = JSON.parse(savedOrderDetail);
        if (orderObj._id === order._id) {
          orderObj.status = newStatus;
          sessionStorage.setItem("selectedOrder", JSON.stringify(orderObj));
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDisputeConfirm = async (disputeData) => {
    try {
      setIsDisputeLoading(true);
      const formData = new FormData();

      Object.keys(disputeData).forEach((key) => {
        if (key === "evidenceDocuments") {
          disputeData[key].forEach((file) => {
            formData.append("evidenceDocuments", file);
          });
        } else {
          formData.append(key, disputeData[key] || "");
        }
      });

      formData.append("orderID", order.orderID);
      if (!formData.has("sellerID")) {
        formData.append("sellerID", seller?._id);
      }

      await api.post("/disputes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Dispute raised successfully! Admin will review it.");
      setIsDisputeModalOpen(false);
    } catch (error) {
      console.error("Error raising dispute:", error);
      toast.error(error.response?.data?.message || "Failed to raise dispute");
    } finally {
      setIsDisputeLoading(false);
    }
  };

  // Map real order data
  const buyer = order.buyerID;
  const buyerName = buyer?.name || "Unknown Buyer";
  const buyerBusiness =
    buyer?.businessName || buyer?.companyName || buyer?.name || "N/A";
  const buyerPhone = buyer?.phone || "N/A";
  const buyerAddress = buyer?.address || "N/A";

  const seller = order.sellerID;
  const sellerName = seller?.name || "Unknown Seller";
  const sellerBusiness =
    seller?.businessName || seller?.companyName || seller?.name || "N/A";
  const sellerPhone = seller?.phone || "N/A";
  const sellerAddress = seller?.address || "N/A";

  const orderDate = new Date(order.createdAt).toLocaleString();

  // Price calculations
  const subtotal = order.products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
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

          <button
            className="odv-dispute-btn"
            onClick={() => setIsDisputeModalOpen(true)}
            title="Report a problem"
          >
            <FaExclamationCircle /> Raise Dispute
          </button>

          <div className="odv-status-dropdown-container">
            <div
              className={`odv-status-badge status-${currentStatus.toLowerCase()} disabled`}
            >
              {currentStatus}
            </div>
          </div>
        </div>
        <div className="odv-header-actions">
          {currentStatus === "Pending" && (
            <button
              className="odv-cancel-btn"
              onClick={() =>
                setConfModal({
                  isOpen: true,
                  orderId: order._id,
                  orderID_Display: order.orderID,
                  newStatus: "Canceled",
                  type: "danger",
                })
              }
            >
              Cancel Order
            </button>
          )}
          {currentStatus === "Delivered" &&
            order.paymentMethod === "COD" &&
            order.paymentStatus === "Pending" && (
              <button
                className="odv-confirm-btn"
                style={{
                  backgroundColor: "#1dc956",
                  color: "white",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
                onClick={() =>
                  setConfModal({
                    isOpen: true,
                    orderId: order._id,
                    orderID_Display: order.orderID,
                    newStatus: "Confirm Cash Paid",
                    type: "success",
                  })
                }
              >
                <FaCheckCircle /> Confirm Cash Paid
              </button>
            )}
          <button
            className="download-invoice-btn"
            onClick={async () =>
              await generateInvoice(
                order,
                {
                  ...seller,
                  businessName: sellerBusiness,
                  address: sellerAddress,
                },
                {
                  ...buyer,
                  businessName: buyerBusiness,
                  address: buyerAddress,
                },
              )
            }
          >
            <FaDownload /> Download Invoice
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confModal.isOpen}
        onClose={() => setConfModal({ ...confModal, isOpen: false })}
        onConfirm={() => {
          handleStatusUpdate(confModal.newStatus);
          setConfModal({ ...confModal, isOpen: false });
        }}
        title={`${confModal.newStatus} Order`}
        message={`Are you sure you want to ${confModal.newStatus?.toLowerCase()} this order? This action cannot be undone.`}
        orderID={confModal.orderID_Display}
        type={confModal.type}
        confirmText={`Yes, ${confModal.newStatus}`}
        cancelText="No, Keep"
      />

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

        {/* ROW 2: Buyer Details and price */}
        <div className="odv-row">
          <div className="odv-left-col">
            <section className="odv-card">
              <h3>Buyer Details (Me)</h3>
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

        {/* ROW 3: Seller Details and Tracker */}
        <div className="odv-row">
          <div className="odv-left-col">
            <section className="odv-card">
              <h3>Seller Information</h3>
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

                {currentStatus === "Canceled" ||
                currentStatus === "Rejected" ? (
                  <div className="track-step rejected">
                    <div className="track-checkpoint">
                      <div className="checkpoint-icon">
                        <FaTimesCircle />
                      </div>
                    </div>
                    <div className="track-info">
                      <span className="track-title">Order {currentStatus}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Step 2: Accepted */}
                    <div
                      className={`track-step ${
                        [
                          "Accepted",
                          "Processing",
                          "Shipping",
                          "Delivered",
                        ].includes(currentStatus)
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
                            ["Processing", "Shipping", "Delivered"].includes(
                              currentStatus,
                            )
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
                        ["Processing", "Shipping", "Delivered"].includes(
                          currentStatus,
                        )
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
      <OrderSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Payment Confirmed!"
        message="You have successfully confirmed the cash payment for this order."
        showPaymentNote={false}
      />
      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onConfirm={handleDisputeConfirm}
        orderID={order.orderID}
        isLoading={isDisputeLoading}
      />
    </div>
  );
};

export default BuyerOrderDetailView;
