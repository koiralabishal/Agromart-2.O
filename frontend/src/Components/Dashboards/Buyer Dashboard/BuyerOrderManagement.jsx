import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaChevronDown } from "react-icons/fa";
import api from "../../../api/axiosConfig";
import Pagination from "../../Common/Pagination";
import ConfirmationModal from "../../Common/ConfirmationModal";
import OrderSuccessModal from "../../Common/OrderSuccessModal";
import "./Styles/BuyerOrderManagement.css";

const BuyerOrderManagement = ({ onViewOrder, ordersProp }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All Orders");
  const [confModal, setConfModal] = useState({
    isOpen: false,
    orderId: "",
    orderID_Display: "",
    newStatus: "",
    type: "warning",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [ordersPlaced, setOrdersPlaced] = useState(() => {
    try {
      const saved = sessionStorage.getItem("buyerOrdersPlaced");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Only show loading if we didn't find anything in cache
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem("buyerOrdersPlaced");
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user?._id || user?.id;

  useEffect(() => {
    if (ordersProp) {
      setOrdersPlaced(ordersProp);
      sessionStorage.setItem("buyerOrdersPlaced", JSON.stringify(ordersProp));
    }
  }, [ordersProp]);

  const fetchOrders = async () => {
    if (!userID || (ordersProp && ordersProp.length > 0)) return;
    try {
      // Buyers only place orders
      const placedRes = await api.get("/orders", {
        params: { userID, role: "buyer" },
      });
      setOrdersPlaced(placedRes.data);
      sessionStorage.setItem(
        "buyerOrdersPlaced",
        JSON.stringify(placedRes.data)
      );

      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userID]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      if (newStatus === "Confirm Cash Paid") {
        await api.put(`/orders/${orderId}/confirm-payment`);
        const updatedOrders = ordersPlaced.map((o) =>
          o._id === orderId ? { ...o, paymentStatus: "Paid" } : o
        );
        setOrdersPlaced(updatedOrders);
        sessionStorage.setItem(
          "buyerOrdersPlaced",
          JSON.stringify(updatedOrders)
        );
        setShowSuccess(true);
        return;
      }

      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      const updatedOrders = ordersPlaced.map((o) =>
        o._id === orderId ? { ...o, status: newStatus } : o
      );
      setOrdersPlaced(updatedOrders);
      sessionStorage.setItem(
        "buyerOrdersPlaced",
        JSON.stringify(updatedOrders)
      );

      // Update local storage for detail view sync if needed
      const savedOrderDetail = sessionStorage.getItem("selectedOrder");
      if (savedOrderDetail) {
        const orderObj = JSON.parse(savedOrderDetail);
        if (orderObj._id === orderId) {
          orderObj.status = newStatus;
          sessionStorage.setItem("selectedOrder", JSON.stringify(orderObj));
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    return `status-${status.toLowerCase()}`;
  };

  const filteredOrders = ordersPlaced
    .filter((order) => {
      const matchesSearch =
        order.orderID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.sellerID?.businessName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.sellerID?.companyName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.sellerID?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === "All Orders" || order.status === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="buyer-order-management">
      <div className="om-header">
        <h1>Order Management</h1>
        <p>Track and manage your orders from your dashboard.</p>
      </div>

      <div className="order-section">
        <div className="os-title-row">
          <h2>Order Placed (Buying)</h2>
        </div>
        <div className="om-controls">
          <div className="om-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="om-filter-container">
            <button
              className={`om-filter-trigger ${
                filter !== "All Orders" ? "active" : ""
              }`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FaFilter />
              <span>{filter}</span>
              <FaChevronDown
                className={`chevron ${isFilterOpen ? "open" : ""}`}
              />
            </button>

            {isFilterOpen && (
              <div className="om-filter-dropdown">
                {[
                  "All Orders",
                  "Pending",
                  "Accepted",
                  "Delivered",
                  "Canceled",
                  "Rejected",
                ].map((f) => (
                  <div
                    key={f}
                    className={`filter-option ${
                      filter === f ? "selected" : ""
                    }`}
                    onClick={() => {
                      setFilter(f);
                      setIsFilterOpen(false);
                    }}
                  >
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="om-table-container">
          <table className="om-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Ordered Items</th>
                <th>Order Date</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    {searchTerm || filter !== "All Orders"
                      ? "No orders match your search criteria."
                      : "No orders placed yet."}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="party-name">{order.orderID}</td>
                    <td className="ordered-items">
                      <div className="item-tags">
                        {order.products.map((item, idx) => (
                          <span key={idx} className="item-tag">
                            {item.productName} ({item.quantity})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="order-date">
                      {formatDate(order.createdAt)}
                    </td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <span className={`status-text ${order.paymentStatus === "Paid" ? "status-paid" : "status-pending-payment"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="order-status">
                      <span
                        className={`status-text ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="order-actions">
                      <button
                        className="om-action-btn view"
                        onClick={() => onViewOrder(order, "placed")}
                      >
                        View
                      </button>
                      {order.status === "Pending" && (
                        <button
                          className="om-action-btn cancel"
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
                          Cancel
                        </button>
                      )}
                      {order.status === "Delivered" &&
                        order.paymentMethod === "COD" &&
                        order.paymentStatus === "Pending" && (
                          <button
                            className="om-action-btn confirm"
                            style={{
                              backgroundColor: "#1dc956",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              cursor: "pointer",
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
                            Confirm Cash Paid
                          </button>
                        )}
                      {order.status !== "Pending" &&
                        !(
                          order.status === "Delivered" &&
                          order.paymentMethod === "COD" &&
                          order.paymentStatus === "Pending"
                        ) && <span className="no-actions"></span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filteredOrders.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confModal.isOpen}
        onClose={() => setConfModal({ ...confModal, isOpen: false })}
        onConfirm={() => {
          handleStatusUpdate(confModal.orderId, confModal.newStatus);
          setConfModal({ ...confModal, isOpen: false });
        }}
        title={`${confModal.newStatus} Order`}
        message={`Are you sure you want to ${confModal.newStatus?.toLowerCase()} this order? This action cannot be undone.`}
        orderID={confModal.orderID_Display}
        type={confModal.type}
        confirmText={`Yes, ${confModal.newStatus}`}
        cancelText="No, Keep"
      />
      <OrderSuccessModal 
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Payment Confirmed!"
        message="You have successfully confirmed the cash payment for this order."
        showPaymentNote={false}
      />
    </div>
  );
};

export default BuyerOrderManagement;
