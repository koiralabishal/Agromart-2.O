import React, { useState } from "react";
import {
  FaRegBell,
  FaTrashAlt,
  FaShoppingBasket,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaRegClock,
} from "react-icons/fa";
import "./Styles/BuyerNotificationsView.css";

const BuyerNotificationsView = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "transaction_successful",
      group: "Today",
      title: "Transaction Successful",
      description: "Payment of Rs. 2,450 for Order #ORD-2024-001 was successful",
      time: "Today, 11:45 AM",
      relativeTime: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "order_accepted",
      group: "Today",
      title: "Order Accepted",
      description: "Your order #ORD-2024-002 has been accepted and is being processed",
      time: "Today, 10:30 AM",
      relativeTime: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "order_delivered",
      group: "Yesterday",
      title: "Order Delivered Successfully",
      description: "Your order #ORD-2024-003 has been delivered successfully",
      time: "Yesterday, 04:00 PM",
      relativeTime: "1 day ago",
      read: true,
    },
    {
      id: 4,
      type: "order_rejected",
      group: "Yesterday",
      title: "Order Rejected",
      description: "Your order #ORD-2024-004 has been rejected by the distributor",
      time: "Yesterday, 02:00 PM",
      relativeTime: "2 days ago",
      read: true,
    },
    {
      id: 5,
      type: "transaction_successful",
      group: "Earlier this week",
      title: "Transaction Successful",
      description: "Payment of Rs. 1,850 for Order #ORD-2024-005 was successful",
      time: "Jan 05, 09:15 AM",
      relativeTime: "3 days ago",
      read: true,
    },
    {
      id: 6,
      type: "order_delivered",
      group: "Earlier this week",
      title: "Order Delivered Successfully",
      description: "Your order #ORD-2024-006 has been delivered successfully",
      time: "Jan 04, 03:45 PM",
      relativeTime: "4 days ago",
      read: true,
    },
    {
      id: 7,
      type: "order_accepted",
      group: "Earlier this week",
      title: "Order Accepted",
      description: "Your order #ORD-2024-007 has been accepted and is being processed",
      time: "Jan 03, 11:00 AM",
      relativeTime: "5 days ago",
      read: true,
    },
  ]);

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "transaction_successful":
        return <FaCheckCircle className="nv-icon" style={{ color: "#1dc956", background: "#dcfce7" }} />;
      case "order_accepted":
        return <FaShoppingBasket className="nv-icon order" />;
      case "order_rejected":
        return <FaTimesCircle className="nv-icon" style={{ color: "#ef4444", background: "#fee2e2" }} />;
      case "order_delivered":
        return <FaTruck className="nv-icon delivery" />;
      default:
        return <FaRegBell className="nv-icon" />;
    }
  };

  const groupedNotifications = notifications.reduce((acc, n) => {
    if (!acc[n.group]) acc[n.group] = [];
    acc[n.group].push(n);
    return acc;
  }, {});

  return (
    <div className="notifications-view">
      <div className="nv-header">
        <div className="nv-header-info">
          <h1>Notifications</h1>
          <p>Recent alerts and updates for your orders</p>
        </div>
        <div className="nv-actions">
          <button className="nv-btn-outline red" onClick={clearAll}>
            <FaTrashAlt /> Clear All
          </button>
        </div>
      </div>

      <div className="nv-list-container">
        {Object.keys(groupedNotifications).length === 0 ? (
          <div className="nv-empty">
            <FaRegBell className="empty-icon" />
            <h3>No notifications yet</h3>
            <p>We'll notify you when something important happens.</p>
          </div>
        ) : (
          Object.keys(groupedNotifications).map((group) => (
            <div key={group} className="nv-group">
              <h3 className="nv-group-title">{group}</h3>
              {groupedNotifications[group].map((n) => (
                <div key={n.id} className={`nv-card ${!n.read ? "unread-glow" : ""}`}>
                  <div className="nv-card-icon-section">{getIcon(n.type)}</div>
                  <div className="nv-card-content">
                    <div className="nv-card-header">
                      <h4>{n.title}</h4>
                      <div className="nv-card-actions">
                        {!n.read && (
                          <button
                            className="nv-action-btn mark"
                            onClick={() => markAsRead(n.id)}
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          className="nv-action-btn clear"
                          onClick={() => removeNotification(n.id)}
                        >
                          <FaTrashAlt /> Clear
                        </button>
                      </div>
                    </div>

                    <div className="nv-card-body">
                      {n.description && <p>{n.description}</p>}
                      {n.time && (
                        <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#64748b" }}>
                          <strong>Time:</strong> {n.time}
                        </p>
                      )}
                    </div>

                    <div className="nv-card-footer">
                      <span className="nv-time">
                        <FaRegClock /> {n.relativeTime}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuyerNotificationsView;
