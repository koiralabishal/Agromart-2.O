import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";
import { FaEye, FaSearch, FaArrowLeft } from "react-icons/fa";
import OrderDetailModal from "./OrderDetailModal";

const AdminOrdersView = ({ cache, onCacheUpdate }) => {
  const [orders, setOrders] = useState(cache || []);
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("received"); // 'received' or 'placed'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      processUsers(cache);
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!cache) setLoading(true);
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data);
      processUsers(res.data);
      onCacheUpdate(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const processUsers = (orderData) => {
    const map = {};

    orderData.forEach((order) => {
      // Process Buyer
      if (order.buyerID) {
        const bid = order.buyerID._id;
        if (!map[bid]) {
          map[bid] = {
            user: order.buyerID,
            placed: [],
            received: [],
          };
        }
        map[bid].placed.push(order);
      }

      // Process Seller
      if (order.sellerID) {
        const sid = order.sellerID._id;
        if (!map[sid]) {
          map[sid] = {
            user: order.sellerID,
            placed: [],
            received: [],
          };
        }
        map[sid].received.push(order);
      }
    });

    setUsersList(Object.values(map));
  };

  // Helper Initials Renderer
  const renderInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "U";
  };

  const handleUserClick = (userWrapper) => {
    setSelectedUser(userWrapper);
    // Set default tab based on role
    if (userWrapper.user.role === "buyer") {
      setActiveTab("placed");
    } else {
      // For others, prioritize Received (Sales) but default to Received
      setActiveTab("received");
    }
  };

  // Filter orders for the detail table
  const getDetailOrders = () => {
    if (!selectedUser) return [];
    let list =
      activeTab === "received" ? selectedUser.received : selectedUser.placed;

    if (searchTerm) {
      list = list.filter((o) =>
        o.orderID.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return list;
  };

  return (
    <div className="admin-view-container">
      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        viewContext={activeTab}
      />

      {/* DATA VIEW */}
      {loading && !cache ? (
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      ) : (
        <>
          {/* VIEW: USER GRID */}
          {!selectedUser && (
            <>
              <div className="um-header">
                <h2 className="um-title">Order Management</h2>
              </div>
              <div
                className="ad-stats-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {usersList.map((data) => (
                  <div
                    key={data.user._id}
                    style={{
                      backgroundColor: "white",
                      padding: "1.5rem",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      border: "1px solid #e5e7eb",
                      transition: "transform 0.2s",
                    }}
                  >
                    {/* Profile Image */}
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        marginBottom: "1rem",
                        border: "3px solid #f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        fontSize: "1.5rem",
                        fontWeight: "600",
                        overflow: "hidden",
                      }}
                    >
                      {data.user.profileImage ? (
                        <img
                          src={data.user.profileImage}
                          alt={data.user.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerText = renderInitials(
                              data.user.name,
                            );
                          }}
                        />
                      ) : (
                        renderInitials(data.user.name)
                      )}
                    </div>

                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#1f2937",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {data.user.name}
                    </h3>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.9rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {data.user.email}
                    </p>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        color: "#9ca3af",
                        fontWeight: "600",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {data.user.role}
                    </span>

                    {/* Stats Row */}
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-around",
                        fontSize: "0.85rem",
                        backgroundColor: "#f9fafb",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                      }}
                    >
                      {(data.user.role === "farmer" ||
                        data.user.role === "collector" ||
                        data.user.role === "supplier") && (
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div
                            style={{ color: "#6b7280", fontSize: "0.75rem" }}
                          >
                            Received
                          </div>
                          <div style={{ color: "#166534", fontWeight: "700" }}>
                            {data.received.length}
                          </div>
                        </div>
                      )}

                      {(data.user.role === "collector" ||
                        data.user.role === "supplier") && (
                        <div
                          style={{
                            width: "1px",
                            backgroundColor: "#e5e7eb",
                            margin: "0 0.5rem",
                          }}
                        ></div>
                      )}

                      {(data.user.role === "buyer" ||
                        data.user.role === "collector" ||
                        data.user.role === "supplier") && (
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div
                            style={{ color: "#6b7280", fontSize: "0.75rem" }}
                          >
                            Placed
                          </div>
                          <div style={{ color: "#2563eb", fontWeight: "700" }}>
                            {data.placed.length}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ width: "100%", marginTop: "auto" }}>
                      <button
                        onClick={() => handleUserClick(data)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          backgroundColor: "#1dc956",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <FaEye /> View Orders
                      </button>
                    </div>
                  </div>
                ))}
                {usersList.length === 0 && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "4rem",
                      color: "#6b7280",
                    }}
                  >
                    No users found with orders.
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW: DETAIL TABLE */}
          {selectedUser && (
            <>
              <div className="um-header">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <button
                    onClick={() => setSelectedUser(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#4b5563",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "1rem",
                      padding: "0.5rem",
                      borderRadius: "50%",
                      backgroundColor: "#f3f4f6",
                    }}
                    title="Back to Grid"
                  >
                    <FaArrowLeft />
                  </button>
                  <div>
                    <h2 className="um-title" style={{ marginBottom: "0.2rem" }}>
                      {selectedUser.user.name}'s Orders
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      {selectedUser.user.role} • {selectedUser.user.email}
                    </span>
                  </div>
                </div>

                <div className="um-actions">
                  <div className="ad-search-bar">
                    <FaSearch color="#9CA3AF" />
                    <input
                      type="text"
                      placeholder="Search Order ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Tabs/Labels */}
              {selectedUser.user.role === "collector" ||
              selectedUser.user.role === "supplier" ? (
                <div className="um-tabs">
                  <button
                    className={`tab-btn ${activeTab === "received" ? "active" : ""}`}
                    onClick={() => setActiveTab("received")}
                  >
                    Orders Received ({selectedUser.received.length})
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "placed" ? "active" : ""}`}
                    onClick={() => setActiveTab("placed")}
                  >
                    Orders Placed ({selectedUser.placed.length})
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    marginBottom: "1.5rem",
                    fontWeight: "600",
                    color: "#6b7280",
                    fontSize: "1rem",
                    padding: "0.5rem 0",
                    borderBottom: "2px solid #1dc956",
                    display: "inline-block",
                  }}
                >
                  Viewing:{" "}
                  {activeTab === "received"
                    ? "Orders Received"
                    : "Orders Placed"}{" "}
                  (
                  {activeTab === "received"
                    ? selectedUser.received.length
                    : selectedUser.placed.length}
                  )
                </div>
              )}

              <div className="um-table-container">
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date & Time</th>
                      <th>{activeTab === "received" ? "Buyer" : "Seller"}</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDetailOrders().map((order) => (
                      <tr key={order._id}>
                        <td>{order.orderID}</td>
                        <td>
                          <div style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td>
                          <div>
                            {activeTab === "received"
                              ? order.buyerID?.name || "N/A"
                              : order.sellerID?.name || "N/A"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {activeTab === "received"
                              ? order.buyerID?.email
                              : order.sellerID?.email}
                          </div>
                        </td>
                        <td>Rs. {order.totalAmount}</td>
                        <td>
                          {order.paymentMethod} <br />
                          <span
                            style={{
                              fontSize: "0.8em",
                              color:
                                order.paymentStatus === "Paid"
                                  ? "green"
                                  : "orange",
                            }}
                          >
                            ({order.paymentStatus})
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${order.status.toLowerCase()}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="um-action-btn btn-view"
                            onClick={() => setSelectedOrder(order)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {getDetailOrders().length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          style={{ textAlign: "center", padding: "2rem" }}
                        >
                          No {activeTab} orders found for this user.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrdersView;
