import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaChevronDown } from "react-icons/fa";
import api from "../../../api/axiosConfig";
import ConfirmationModal from "../../Common/ConfirmationModal";
import OrderSuccessModal from "../../Common/OrderSuccessModal";
import "./Styles/OrderManagement.css";

const OrderManagement = ({ onViewOrder }) => {
  const [ordersPlaced, setOrdersPlaced] = useState(() => {
    try {
      const saved = sessionStorage.getItem("ordersPlaced");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [ordersReceived, setOrdersReceived] = useState(() => {
    try {
      const saved = sessionStorage.getItem("ordersReceived");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Only show loading if we didn't find anything in cache
  const [loading, setLoading] = useState(() => {
    return (
      !sessionStorage.getItem("ordersPlaced") &&
      !sessionStorage.getItem("ordersReceived")
    );
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user?._id || user?.id;

  const [searchTermPlaced, setSearchTermPlaced] = useState("");
  const [filterPlaced, setFilterPlaced] = useState("All Orders");
  const [searchTermReceived, setSearchTermReceived] = useState("");
  const [filterReceived, setFilterReceived] = useState("All Orders");
  const [confModal, setConfModal] = useState({
    isOpen: false,
    orderId: "",
    orderID_Display: "",
    newStatus: "", // "Rejected" or "Canceled"
    type: "warning",
    title: "",
    message: "",
    orderType: "", // "placed" or "received"
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFilterPlacedOpen, setIsFilterPlacedOpen] = useState(false);
  const [isFilterReceivedOpen, setIsFilterReceivedOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch "Placed" orders (User is Buyer)
        const placedRes = await api.get("/orders", {
          params: { userID, role: "buyer" },
        });
        setOrdersPlaced(placedRes.data);
        sessionStorage.setItem("ordersPlaced", JSON.stringify(placedRes.data));

        // Fetch "Received" orders (User is Seller)
        const receivedRes = await api.get("/orders", {
          params: { userID, role: "seller" },
        });
        setOrdersReceived(receivedRes.data);
        sessionStorage.setItem(
          "ordersReceived",
          JSON.stringify(receivedRes.data)
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    if (userID) {
      fetchOrders();
    }
  }, [userID]);

  const handleStatusUpdate = async (orderId, newStatus, type = "received") => {
    try {
      if (newStatus === "Confirm Cash Paid") {
        await api.put(`/orders/${orderId}/confirm-payment`);
        const updatedOrders = ordersPlaced.map((o) =>
          o._id === orderId ? { ...o, paymentStatus: "Paid" } : o
        );
        setOrdersPlaced(updatedOrders);
        sessionStorage.setItem("ordersPlaced", JSON.stringify(updatedOrders));
        setShowSuccess(true);
        return;
      }

      await api.put(`/orders/${orderId}/status`, { status: newStatus });

      if (type === "received") {
        const updatedOrders = ordersReceived.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        );
        setOrdersReceived(updatedOrders);
        sessionStorage.setItem("ordersReceived", JSON.stringify(updatedOrders));
      } else {
        const updatedOrders = ordersPlaced.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        );
        setOrdersPlaced(updatedOrders);
        sessionStorage.setItem("ordersPlaced", JSON.stringify(updatedOrders));
      }

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
      alert("Failed to update status");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    return `status-${status.toLowerCase()}`;
  };

  const filterOrderList = (orders, searchTerm, activeFilter) => {
    return orders
      .filter((order) => {
        const matchesSearch =
          order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.products.some((p) =>
            p.productName.toLowerCase().includes(searchTerm.toLowerCase())
          );

        const matchesFilter =
          activeFilter === "All Orders" || order.status === activeFilter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filteredPlaced = filterOrderList(
    ordersPlaced,
    searchTermPlaced,
    filterPlaced
  );
  const filteredReceived = filterOrderList(
    ordersReceived,
    searchTermReceived,
    filterReceived
  );

  return (
    <div className="order-management">
      <div className="om-header">
        <h1>Order Management</h1>
        <p>View and manage your orders.</p>
      </div>

      {/* Order Placed Section */}
      <div className="order-section">
        <div className="os-title-row">
          <h2>Order Placed (Buying from Farmers)</h2>
        </div>
        <div className="om-controls">
          <div className="om-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTermPlaced}
              onChange={(e) => setSearchTermPlaced(e.target.value)}
            />
          </div>
          <div className="om-filter-container">
            <button
              className={`om-filter-trigger ${
                filterPlaced !== "All Orders" ? "active" : ""
              }`}
              onClick={() => setIsFilterPlacedOpen(!isFilterPlacedOpen)}
            >
              <FaFilter />
              <span>{filterPlaced}</span>
              <FaChevronDown
                className={`chevron ${isFilterPlacedOpen ? "open" : ""}`}
              />
            </button>

            {isFilterPlacedOpen && (
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
                      filterPlaced === f ? "selected" : ""
                    }`}
                    onClick={() => {
                      setFilterPlaced(f);
                      setIsFilterPlacedOpen(false);
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
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : filteredPlaced.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredPlaced.map((order) => (
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
                          className="om-action-btn text-action cancel"
                          onClick={() =>
                            setConfModal({
                              isOpen: true,
                              orderId: order._id,
                              orderID_Display: order.orderID,
                              newStatus: "Canceled",
                              type: "danger",
                              title: "Cancel Order",
                              message:
                                "Are you sure you want to cancel this order? This action cannot be undone.",
                              orderType: "placed",
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
                                title: "Confirm Payment",
                                message:
                                  "Are you sure you want to confirm that you have paid cash for this order?",
                                orderType: "placed",
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
        </div>
      </div>

      {/* Order Received Section */}
      <div className="order-section" style={{ marginTop: "3rem" }}>
        <div className="os-title-row">
          <h2>Order Received (Selling to Suppliers)</h2>
        </div>
        <div className="om-controls">
          <div className="om-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTermReceived}
              onChange={(e) => setSearchTermReceived(e.target.value)}
            />
          </div>
          <div className="om-filter-container">
            <button
              className={`om-filter-trigger ${
                filterReceived !== "All Orders" ? "active" : ""
              }`}
              onClick={() => setIsFilterReceivedOpen(!isFilterReceivedOpen)}
            >
              <FaFilter />
              <span>{filterReceived}</span>
              <FaChevronDown
                className={`chevron ${isFilterReceivedOpen ? "open" : ""}`}
              />
            </button>

            {isFilterReceivedOpen && (
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
                      filterReceived === f ? "selected" : ""
                    }`}
                    onClick={() => {
                      setFilterReceived(f);
                      setIsFilterReceivedOpen(false);
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
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : filteredReceived.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    No orders received yet.
                  </td>
                </tr>
              ) : (
                filteredReceived.map((order) => (
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
                        onClick={() => onViewOrder(order, "received")}
                      >
                        View
                      </button>
                      {order.status === "Pending" && (
                        <>
                          <button
                            className="om-action-btn text-action"
                            onClick={() =>
                              handleStatusUpdate(order._id, "Accepted")
                            }
                          >
                            Accept
                          </button>
                          <button
                            className="om-action-btn text-action reject"
                            onClick={() =>
                              setConfModal({
                                isOpen: true,
                                orderId: order._id,
                                orderID_Display: order.orderID,
                                newStatus: "Rejected",
                                type: "danger",
                                title: "Reject Order",
                                message:
                                  "Are you sure you want to reject this order? This action cannot be undone.",
                                orderType: "received",
                              })
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {order.status !== "Pending" && (
                        <span className="no-actions"></span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confModal.isOpen}
        onClose={() => setConfModal({ ...confModal, isOpen: false })}
        onConfirm={() => {
          handleStatusUpdate(
            confModal.orderId,
            confModal.newStatus,
            confModal.orderType
          );
          setConfModal({ ...confModal, isOpen: false });
        }}
        title={confModal.title}
        message={confModal.message}
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

export default OrderManagement;
