import React from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import "./Styles/OrderManagement.css";

const OrderManagement = ({ onViewOrder }) => {
  const orders = [
    {
      id: "AGRM-789012345",
      collector: "Green Harvest Co.",
      items: ["Tomatoes: 200kg", "Potatoes: 150kg"],
      date: "2023-10-26",
      status: "Pending",
    },
    {
      id: "AGRM-789012346",
      collector: "Farm Fresh Hub",
      items: ["Apples: 50crates", "Oranges: 30crates", "Bananas: 40bunches"],
      date: "2023-10-25",
      status: "Accepted",
    },
    {
      id: "AGRM-789012347",
      collector: "Urban Greengrocer",
      items: ["Spinach: 80bundles", "Lettuce: 60heads"],
      date: "2023-10-24",
      status: "Pending",
    },
    {
      id: "AGRM-789012348",
      collector: "Healthy Bites Market",
      items: ["Carrots: 120kg"],
      date: "2023-10-23",
      status: "Completed",
    },
    {
      id: "AGRM-789012349",
      collector: "Local Produce Mart",
      items: ["Cucumbers: 90kg", "Bell Peppers: 70kg"],
      date: "2023-10-22",
      status: "Accepted",
    },
    {
      id: "AGRM-789012350",
      collector: "The Veggie Basket",
      items: ["Broccoli: 45heads", "Cauliflower: 35heads"],
      date: "2023-10-21",
      status: "Pending",
    },
  ];

  return (
    <div className="order-management">
      <div className="om-header">
        <h1>Order Management</h1>
        <p>View and manage incoming orders from collectors and aggregators.</p>
      </div>

      <div className="om-controls">
        <div className="om-search">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search orders..." />
        </div>
        <div className="om-filters">
          <button className="filter-btn active">All Orders</button>
          <button className="filter-btn">Pending</button>
          <button className="filter-btn">Accepted</button>
          <button className="filter-btn">Completed</button>
        </div>
      </div>

      <div className="om-table-container">
        <table className="om-table">
          <thead>
            <tr>
              <th>Collector</th>
              <th>Ordered Items</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="collector-name">{order.collector}</td>
                <td className="ordered-items">
                  <div className="item-tags">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="item-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="order-date">{order.date}</td>
                <td className="order-status">
                  <span
                    className={`status-text status-${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="order-actions">
                  <button className="om-action-btn view" onClick={onViewOrder}>
                    View
                  </button>
                  {order.status === "Pending" && (
                    <>
                      <button className="om-action-btn text-action">
                        Accept
                      </button>
                      <button className="om-action-btn text-action reject">
                        Reject
                      </button>
                    </>
                  )}
                  {order.status !== "Pending" && (
                    <span className="no-actions">No Actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
