import React from "react";
import { FaSearch } from "react-icons/fa";
import "./Styles/OrderManagement.css";

const OrderManagement = ({ onViewOrder }) => {
  const ordersPlaced = [
    { id: "OP-1", farmer: "Green Harvest Co.", items: ["Tomatoes: 200kg", "Potatoes: 150kg"], date: "2023-10-26", status: "Pending" },
    { id: "OP-2", farmer: "Farm Fresh Hub", items: ["Apples: 50crates", "Oranges: 30crates"], date: "2023-10-25", status: "Rejected" },
    { id: "OP-3", farmer: "Urban Greengrocer", items: ["Spinach: 80bundles"], date: "2023-10-24", status: "Pending" },
    { id: "OP-4", farmer: "Healthy Bites Market", items: ["Carrots: 120kg"], date: "2023-10-23", status: "Completed" },
    { id: "OP-5", farmer: "Local Produce Mart", items: ["Cucumbers: 90kg"], date: "2023-10-22", status: "Accepted" },
    { id: "OP-6", farmer: "The Veggie Basket", items: ["Broccoli: 45heads"], date: "2023-10-21", status: "Pending" },
  ];

  const ordersReceived = [
    { id: "OR-1", distributor: "Green Harvest Co.", items: ["Tomatoes: 200kg", "Potatoes: 150kg"], date: "2023-10-26", status: "Pending" },
    { id: "OR-2", distributor: "Farm Fresh Hub", items: ["Apples: 50crates", "Oranges: 30crates"], date: "2023-10-25", status: "Accepted" },
    { id: "OR-3", distributor: "Urban Greengrocer", items: ["Spinach: 80bundles"], date: "2023-10-24", status: "Pending" },
    { id: "OR-4", distributor: "Healthy Bites Market", items: ["Carrots: 120kg"], date: "2023-10-23", status: "Completed" },
    { id: "OR-5", distributor: "Local Produce Mart", items: ["Cucumbers: 90kg"], date: "2023-10-22", status: "Accepted" },
    { id: "OR-6", distributor: "The Veggie Basket", items: ["Broccoli: 45heads"], date: "2023-10-21", status: "Pending" },
  ];

  return (
    <div className="order-management">
      <div className="om-header">
        <h1>Order Management</h1>
        <p>View and manage incoming orders from distributor.</p>
      </div>

      {/* Order Placed Section */}
      <div className="order-section">
        <div className="os-title-row">
           <h2>Order Placed</h2>
           <div className="om-controls">
             <div className="om-search">
               <FaSearch className="search-icon" />
               <input type="text" placeholder="Search orders..." />
             </div>
             <div className="om-filters">
               <button className="filter-btn active">All Orders</button>
               <button className="filter-btn">Pending</button>
               <button className="filter-btn">Rejected</button>
               <button className="filter-btn">Completed</button>
             </div>
           </div>
        </div>
        <div className="om-table-container">
          <table className="om-table">
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Ordered Items</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersPlaced.map((order) => (
                <tr key={order.id}>
                  <td className="party-name">{order.farmer}</td>
                  <td className="ordered-items">
                    <div className="item-tags">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="item-tag">{item}</span>
                      ))}
                    </div>
                  </td>
                  <td className="order-date">{order.date}</td>
                  <td className="order-status">
                    <span className={`status-text status-${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td className="order-actions">
                    <button className="om-action-btn view" onClick={() => onViewOrder(order, "placed")}>View</button>
                    {order.status === "Pending" && <button className="om-action-btn text-action reject">Cancel</button>}
                    {order.status !== "Pending" && <span className="no-actions">No Action</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Received Section */}
      <div className="order-section" style={{ marginTop: "3rem" }}>
        <div className="os-title-row">
           <h2>Order Received</h2>
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
        </div>
        <div className="om-table-container">
          <table className="om-table">
            <thead>
              <tr>
                <th>Distributor</th>
                <th>Ordered Items</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersReceived.map((order) => (
                <tr key={order.id}>
                  <td className="party-name">{order.distributor}</td>
                  <td className="ordered-items">
                    <div className="item-tags">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="item-tag">{item}</span>
                      ))}
                    </div>
                  </td>
                  <td className="order-date">{order.date}</td>
                  <td className="order-status">
                    <span className={`status-text status-${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td className="order-actions">
                    <button className="om-action-btn view" onClick={() => onViewOrder(order, "received")}>View</button>
                    {order.status === "Pending" && (
                      <>
                        <button className="om-action-btn text-action">Accept</button>
                        <button className="om-action-btn text-action reject">Reject</button>
                      </>
                    )}
                    {order.status !== "Pending" && <span className="no-actions">No Actions</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
