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

const NotificationsView = ({ orders = [], walletData = null }) => {
  const [clearedIds, setClearedIds] = useState([]);

  // Transform Orders and Transactions into Notifications
  const generateNotifications = () => {
    let allNotifs = [];

    // 1. Process Orders
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      allNotifs.push({
        id: `order-${order._id}`,
        type: "order",
        title: "Order Received",
        collector: order.buyerID?.name || "Unknown Buyer",
        items: order.products.map(p => `${p.productName} (${p.quantity} ${p.unit || ''})`),
        createdAt: orderDate,
        reference: order.orderID,
      });
    });

    // 2. Process Transactions (Payments)
    if (walletData) {
      const transactions = [
        ...(walletData.onlineTransactions || []),
        ...(walletData.codTransactions || [])
      ];

      transactions.forEach(t => {
        const tDate = new Date(t.createdAt);
        allNotifs.push({
          id: `payment-${t._id}`,
          type: "payment",
          title: t.status === 'Locked' ? "Payment Locked (Pending Delivery)" : "Payment Received",
          description: t.description,
          amount: `Rs. ${t.amount.toLocaleString()}`,
          createdAt: tDate,
        });
      });
    }

    // 3. Filter out cleared notifications
    allNotifs = allNotifs.filter(n => !clearedIds.includes(n.id));

    // 4. Sort by date (latest first)
    allNotifs.sort((a, b) => b.createdAt - a.createdAt);

    // 5. Group and Format
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return allNotifs.map(n => {
      const nDate = new Date(n.createdAt);
      const isToday = nDate >= today;
      
      return {
        ...n,
        group: isToday ? "Today" : "Earlier",
        time: nDate.toLocaleString(),
        relativeTime: nDate.toLocaleDateString() === now.toLocaleDateString() 
          ? nDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : nDate.toLocaleDateString(),
      };
    });
  };

  const notifications = generateNotifications();

  const removeNotification = (id) => {
    setClearedIds(prev => [...prev, id]);
  };

  const clearAll = () => {
    setClearedIds(notifications.map(n => n.id));
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
