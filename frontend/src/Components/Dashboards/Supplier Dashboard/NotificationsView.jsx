import React, { useState } from "react";
import {
  FaRegBell,
  FaTrashAlt,
  FaShoppingBasket,
  FaCheckCircle,
  FaTimesCircle,
  FaExchangeAlt,
  FaWallet,
  FaRegClock,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import "./Styles/NotificationsView.css";

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "payment_received",
      group: "Today",
      title: "Payment Received",
      description: "Received Rs. 45,000 from Distributor 'Fresh Foods Ltd'.",
      amount: "Rs. 45,000",
      time: "Today, 11:45 AM",
      relativeTime: "10 mins ago",
    },
    {
      id: 2,
      type: "order_accepted",
      group: "Today",
      title: "Order Accepted",
      farmer: "Ramesh Kumar",
      description: "Your order for Fresh Red Tomatoes has been accepted.",
      items: ["Fresh Red Tomatoes (500 kg)"],
      time: "Today, 10:30 AM",
      relativeTime: "1 hour ago",
    },
    {
      id: 3,
      type: "order_rejected",
      group: "Yesterday",
      title: "Order Rejected",
      farmer: "Sita Verma",
      description: "Order rejected due to insufficient stock.",
      items: ["Organic Potatoes (200 kg)"],
      time: "Yesterday, 02:00 PM",
      relativeTime: "Yesterday",
    },
    {
      id: 4,
      type: "order_received",
      group: "Yesterday",
      title: "Order Received",
      farmer: "Hari Prasad",
      items: ["Organic Potatoes (1000 kg)"],
      time: "Yesterday, 04:00 PM",
      relativeTime: "Yesterday",
    },
    {
      id: 5,
      type: "payment_sent",
      group: "Earlier this week",
      title: "Payment Sent",
      description: "Payment to Farmer Hari Prasad regarding Order #ORD-2024-003",
      amount: "Rs. 30,000",
      relativeTime: "3 days ago",
    },
  ]);

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    switch (type) {
      case "order_received":
      case "order_accepted":
        return <FaShoppingBasket className="nv-icon order" />;
      case "payment_sent":
        return <TbCurrencyRupeeNepalese className="nv-icon payment" />;
      case "payment_received":
        return <FaWallet className="nv-icon" style={{ color: "#1dc956", background: "#dcfce7" }} />;
      case "order_rejected":
        return <FaTimesCircle className="nv-icon" style={{ color: "#ef4444", background: "#fee2e2" }} />;
      case "alert":
        return <FaRegBell className="nv-icon" style={{ color: "#ef4444", background: "#fee2e2" }} />;
      default:
        return <FaCheckCircle className="nv-icon delivery" />;
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
          <p>Recent alerts and updates for your collection center operations</p>
        </div>
        <div className="nv-actions">
          <button className="nv-btn-outline red" onClick={clearAll}>
            <FaTrashAlt /> Clear All
          </button>
        </div>
      </div>

      <div className="nv-list-container">
        {Object.keys(groupedNotifications).map((group) => (
          <div key={group} className="nv-group">
            <h3 className="nv-group-title">{group}</h3>
            {groupedNotifications[group].map((n) => (
              <div key={n.id} className="nv-card">
                <div className="nv-card-icon-section">{getIcon(n.type)}</div>
                <div className="nv-card-content">
                  <div className="nv-card-header">
                    <h4>{n.title}</h4>
                    <div className="nv-card-actions">
                      <button
                        className="nv-action-btn clear"
                        onClick={() => removeNotification(n.id)}
                      >
                        <FaTrashAlt /> Clear
                      </button>
                    </div>
                  </div>

                  <div className="nv-card-body">
                    {n.farmer && (
                      <p>
                        <strong>Farmer:</strong> {n.farmer}
                      </p>
                    )}
                    {n.items && (
                      <ul className="nv-items-list">
                        <li>
                          <strong>Items:</strong>
                        </li>
                        {n.items.map((item, idx) => (
                          <li key={idx}>- {item}</li>
                        ))}
                      </ul>
                    )}
                    {n.description && <p>{n.description}</p>}
                    {n.amount && (
                      <p>
                        <strong>Amount:</strong> {n.amount}
                      </p>
                    )}
                    {n.time && (
                      <p>
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
        ))}

        {notifications.length === 0 && (
          <div className="nv-empty">
            <FaRegBell className="empty-icon" />
            <h3>No notifications yet</h3>
            <p>We'll notify you when something important happens.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
