import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./Styles/BuyerOrderManagement.css";

const BuyerOrderManagement = ({ onViewOrder }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All Orders");

  // Mock placed orders data
  const placedOrders = [
    {
      id: "ORD-2024-001",
      date: "2024-01-09",
      distributor: "Prime Distribution Co.",
      items: [
        "Tomatoes: 50kg",
        "Potatoes: 30kg",
        "Onions: 20kg",
        "Carrots: 10kg",
      ],
      total: 2450,
      status: "Processing",
    },
    {
      id: "ORD-2024-002",
      date: "2024-01-08",
      distributor: "Swift Logistics",
      items: ["Apples: 20kg", "Bananas: 15dozen"],
      total: 1850,
      status: "Pending",
    },
    {
      id: "ORD-2024-003",
      date: "2024-01-07",
      distributor: "Valley Distributors",
      items: ["Cabbage: 40kg", "Cauliflower: 30kg", "Spinach: 50bundles"],
      total: 3200,
      status: "Delivered",
    },
    {
      id: "ORD-2024-004",
      date: "2024-01-06",
      distributor: "Express Distribution",
      items: ["Oranges: 25kg", "Grapes: 10kg", "Pomegranate: 5kg"],
      total: 1600,
      status: "Rejected",
    },
    {
      id: "ORD-2024-005",
      date: "2024-01-05",
      distributor: "Metro Distributors Ltd",
      items: ["Rice: 100kg", "Wheat: 50kg"],
      total: 2900,
      status: "Delivered",
    },
    {
      id: "ORD-2024-006",
      date: "2024-01-04",
      distributor: "Nationwide Distribution",
      items: ["Milk: 50L", "Curd: 20kg"],
      total: 950,
      status: "Processing",
    },
  ];

  const filteredOrders = placedOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.distributor.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "All Orders") return matchesSearch;
    return matchesSearch && order.status === filter;
  });

  return (
    <div className="order-management">
      <div className="om-header">
        <h1>My Orders</h1>
        <p>Track and manage your purchase orders.</p>
      </div>

      <div className="order-section">
        <div className="os-title-row">
          <h2>Order Placed</h2>
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
            <div className="om-filters">
              {[
                "All Orders",
                "Pending",
                "Processing",
                "Delivered",
                "Rejected",
              ].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="party-name">{order.distributor}</td>
                    <td className="ordered-items">
                      <div className="item-tags">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="item-tag">
                            {item}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="item-tag more">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="order-date">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="order-status">
                      <span
                        className={`status-text status-${order.status.toLowerCase()}`}
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
                        <button className="om-action-btn text-action reject">
                          Cancel
                        </button>
                      )}
                      {order.status !== "Pending" && (
                        <span className="no-actions">No Action</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-orders">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BuyerOrderManagement;
