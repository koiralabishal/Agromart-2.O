import React, { useState, useEffect } from "react";
import { FaSearch, FaEye, FaFilter, FaChevronDown } from "react-icons/fa";
import api from "../../../api/axiosConfig";
import Pagination from "../../Common/Pagination";
import ConfirmationModal from "../../Common/ConfirmationModal";
import "./Styles/OrderManagement.css";

const OrderManagement = ({ onViewOrder }) => {
  const [ordersReceived, setOrdersReceived] = useState(() => {
    try {
      const saved = sessionStorage.getItem("farmerOrdersReceived");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Only show loading if we didn't find anything in cache
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem("farmerOrdersReceived");
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user?._id || user?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Orders");
  const [confModal, setConfModal] = useState({
    isOpen: false,
    orderId: "",
    orderID_Display: "",
    newStatus: "",
    type: "warning"
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Farmers only receive orders (they are sellers)
        const receivedRes = await api.get("/orders", {
            params: { userID, role: "seller" }
        });
        setOrdersReceived(receivedRes.data);
        sessionStorage.setItem("farmerOrdersReceived", JSON.stringify(receivedRes.data));
        
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      const updatedOrders = ordersReceived.map(o => 
        o._id === orderId ? { ...o, status: newStatus } : o
      );
      setOrdersReceived(updatedOrders);
      sessionStorage.setItem("farmerOrdersReceived", JSON.stringify(updatedOrders));
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

  const filteredOrders = ordersReceived.filter((order) => {
    const matchesSearch =
      order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products.some((p) =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesFilter =
      activeFilter === "All Orders" || order.status === activeFilter;

    return matchesSearch && matchesFilter;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="order-management">
      <div className="om-header">
        <h1>Order Management</h1>
        <p>View and manage incoming orders from collectors and aggregators.</p>
      </div>

      <div className="om-controls">
        <div className="om-search">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search order ID or products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="om-filter-container">
          <button 
            className={`om-filter-trigger ${activeFilter !== "All Orders" ? "active" : ""}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FaFilter />
            <span>{activeFilter}</span>
            <FaChevronDown className={`chevron ${isFilterOpen ? "open" : ""}`} />
          </button>
          
          {isFilterOpen && (
            <div className="om-filter-dropdown">
              {["All Orders", "Pending", "Accepted", "Delivered", "Canceled", "Rejected"].map((filter) => (
                <div 
                  key={filter}
                  className={`filter-option ${activeFilter === filter ? "selected" : ""}`}
                  onClick={() => {
                    setActiveFilter(filter);
                    setIsFilterOpen(false);
                  }}
                >
                  {filter}
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
                <tr><td colSpan="7" style={{textAlign:"center", padding:"1rem"}}>Loading orders...</td></tr>
            ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign:"center", padding:"1rem"}}>No orders found.</td></tr>
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
                  <td className="order-date">{formatDate(order.createdAt)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    <span className={`status-text ${order.paymentStatus === "Paid" ? "status-paid" : "status-pending-payment"}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="order-status">
                    <span className={`status-text ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="order-actions">
                    <button className="om-action-btn view" onClick={() => onViewOrder(order, "received")}>
                      View
                    </button>
                    {order.status === "Pending" && (
                      <>
                        <button 
                          className="om-action-btn text-action"
                          onClick={() => handleStatusUpdate(order._id, "Accepted")}
                        >
                          Accept
                        </button>
                        <button 
                          className="om-action-btn text-action reject"
                          onClick={() => setConfModal({
                            isOpen: true,
                            orderId: order._id,
                            orderID_Display: order.orderID,
                            newStatus: "Rejected",
                            type: "danger"
                          })}
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
        {filteredOrders.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
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
    </div>
  );
};

export default OrderManagement;
