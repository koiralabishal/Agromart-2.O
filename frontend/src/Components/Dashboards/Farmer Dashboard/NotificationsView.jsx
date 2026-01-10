import React, { useState } from "react";
import {
  FaRegBell,
  FaCheckDouble,
  FaTrashAlt,
  FaShoppingBasket,
  FaMoneyBillWave,
  FaCheckCircle,
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaRegClock,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import "./Styles/NotificationsView.css";

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      group: "Today",
      title: "Order Received",
      collector: "Green Harvest Co.",
      items: ["Organic Carrots (50 kg)", "Fresh Lettuce (20 units)"],
      time: "April 23, 2024, 10:30 AM",
      relativeTime: "2 hours ago",
    },
    {
      id: 2,
      type: "payment",
      group: "Today",
      title: "Transaction Received",
      description: "Transaction: Harvest Loan Repayment",
      amount: "Rs. 1,25,000",
      relativeTime: "3 hours ago",
    },
    {
      id: 3,
      type: "order",
      group: "Earlier this week",
      title: "Order Received",
      collector: "Rural Fresh Markets",
      items: ["Premium Tomatoes (100 kg)", "Bell Peppers (30 units)"],
      time: "April 19, 2024, 02:00 PM",
      relativeTime: "April 19, 2024, 02:00 PM",
    },
    {
      id: 4,
      type: "payment",
      group: "Earlier this week",
      title: "Transaction Received",
      description: "Transaction: Seed Purchase",
      amount: "Rs. 30,000",
      relativeTime: "April 18, 2024, 11:00 AM",
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
      case "order":
        return <FaShoppingBasket className="nv-icon order" />;
      case "payment":
        return <TbCurrencyRupeeNepalese className="nv-icon payment" />;
      case "delivery":
        return <FaCheckCircle className="nv-icon delivery" />;
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
          <p>Recent alerts and updates for your farm operations</p>
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
                    {n.collector && (
                      <p>
                        <strong>Collector:</strong> {n.collector}
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
                    {n.reference && (
                      <p>
                        <strong>Order Reference:</strong> {n.reference}
                      </p>
                    )}
                    {n.timestamp && (
                      <p>
                        <strong>Delivery Timestamp:</strong> {n.timestamp}
                      </p>
                    )}
                    {n.time && (
                      <p>
                        <strong>Order Date/Time:</strong> {n.time}
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

        {notifications.length > 0 && (
          <div className="nv-load-more">
            <button className="nv-btn-load">Load More Notifications</button>
          </div>
        )}

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
