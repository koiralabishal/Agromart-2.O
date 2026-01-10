import React, { useState, useEffect } from "react";
import {
  FaLeaf,
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaChartBar,
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaStar,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaCommentDots,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import ProductManagement from "./ProductManagement";
import AddProductView from "./AddProductView";
import OrderManagement from "./OrderManagement";
import OrderDetailView from "./OrderDetailView";
import DetailedAnalytics from "./DetailedAnalytics";
import SettingsView from "./SettingsView";
import NotificationsView from "./NotificationsView";
import ChatView from "./ChatView";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Styles/FarmerDashboard.css";

const FarmerDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(sessionStorage.getItem("farmerActiveView") || "dashboard");
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("farmerActiveView", activeView);
  }, [activeView]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "John Doe" };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      sessionStorage.removeItem("farmerActiveView");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.removeItem("user");
      sessionStorage.removeItem("farmerActiveView");
      navigate("/");
    }
  };

  // Mock Data for Charts
  const salesData = [
    { name: "Jan", fruits: 400, vegetables: 240 },
    { name: "Feb", fruits: 300, vegetables: 139 },
    { name: "Mar", fruits: 200, vegetables: 980 },
    { name: "Apr", fruits: 278, vegetables: 390 },
    { name: "May", fruits: 189, vegetables: 480 },
    { name: "Jun", fruits: 239, vegetables: 380 },
    { name: "Jul", fruits: 349, vegetables: 430 },
    { name: "Aug", fruits: 200, vegetables: 500 },
    { name: "Sep", fruits: 278, vegetables: 390 },
    { name: "Oct", fruits: 189, vegetables: 480 },
    { name: "Nov", fruits: 239, vegetables: 380 },
    { name: "Dec", fruits: 349, vegetables: 430 },
  ];

  // Sorted for Max to Min display in Bar Chart
  const demandData = [
    { name: "Tomatoes", value: 500 },
    { name: "Potatoes", value: 450 },
    { name: "Onions", value: 400 },
    { name: "Bell Peppers", value: 370 },
    { name: "Apples", value: 350 },
    { name: "Oranges", value: 300 },
    { name: "Carrots", value: 280 },
    { name: "Spinach", value: 250 },
  ];

  return (
    <div className="farmer-dashboard-container">
      {/* Header */}
      <header className="fd-header">
        <div className="fd-logo">
          <FaLeaf /> <span>AgroMart</span>
        </div>

        <nav className={`fd-nav ${isSidebarOpen ? "sidebar-open" : ""}`}>
          <div className="fd-mobile-logo">
            <FaLeaf /> <span>AgroMart</span>
          </div>
          <div
            className={`fd-nav-item ${
              activeView === "dashboard" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("dashboard");
              setIsSidebarOpen(false);
            }}
          >
            <FaHome /> Dashboard
          </div>
          <div
            className={`fd-nav-item ${
              activeView === "products" || activeView === "addProduct"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveView("products");
              setIsSidebarOpen(false);
            }}
          >
            <FaBoxOpen /> Products
          </div>
          <div
            className={`fd-nav-item ${
              activeView === "orders" || activeView === "orderDetail"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveView("orders");
              setIsSidebarOpen(false);
            }}
          >
            <FaShoppingCart /> Orders
          </div>
          <div
            className={`fd-nav-item ${
              activeView === "analytics" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("analytics");
              setIsSidebarOpen(false);
            }}
          >
            <FaChartBar /> Analytics
          </div>
          <div
            className={`fd-nav-item ${
              activeView === "settings" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("settings");
              setIsSidebarOpen(false);
            }}
          >
            <FaCog /> Settings
          </div>
        </nav>
        <div className="fd-profile-actions">
          {/* Hamburger Menu Toggle (Mobile) */}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div
            className="fd-icon-btn"
            onClick={() => setActiveView("notifications")}
            style={{
              cursor: "pointer",
              color: activeView === "notifications" ? "#1dc956" : "inherit",
            }}
            title="Notifications"
          >
            <FaBell />
          </div>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="Profile"
            className="fd-profile-pic"
          />
          <div className="fd-icon-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="fd-main-content">
        {activeView === "dashboard" && (
          <>
            <section className="fd-hero">
              <h1>Welcome To AgroMart, {user.name}!</h1>
              <p>
                Here's an overview of your farm's performance and operations.
              </p>
            </section>

            {/* Stats Grid */}
            <section className="fd-stats-grid">
              {/* Card 1: Total Sales */}
              <div className="fd-stat-card fd-card-green">
                <div className="fd-stat-header">
                  <span className="fd-stat-title">Total Sales</span>
                  <TbCurrencyRupeeNepalese className="fd-stat-icon" />
                </div>
                <div className="fd-stat-value">Rs. 25,450</div>
                <div className="fd-stat-footer">Up 12% from last month</div>
              </div>

              {/* Card 2: Pending Orders */}
              <div className="fd-stat-card fd-card-yellow">
                <div className="fd-stat-header">
                  <span className="fd-stat-title">Pending Orders</span>
                  <FaShoppingCart className="fd-stat-icon" />
                </div>
                <div className="fd-stat-value">12</div>
                <div className="fd-stat-footer">
                  Requiring immediate attention
                </div>
              </div>

              {/* Card 3: New Products Listed */}
              <div className="fd-stat-card fd-card-light-green">
                <div className="fd-stat-header">
                  <span className="fd-stat-title">New Products Listed</span>
                  <FaBoxOpen className="fd-stat-icon" />
                </div>
                <div className="fd-stat-value">5</div>
                <div className="fd-stat-footer">Added this week</div>
              </div>

              {/* Card 4: Customer Satisfaction */}
              <div className="fd-stat-card fd-card-green">
                <div className="fd-stat-header">
                  <span className="fd-stat-title">Customer Satisfaction</span>
                  <FaStar className="fd-stat-icon" />
                </div>
                <div className="fd-stat-value">4.8/5</div>
                <div className="fd-stat-footer">Excellent reviews</div>
              </div>
            </section>

            {/* Analytics Section */}
            <section className="fd-analytics">
              <div className="fd-analytics-header">
                <h2>Analytics Overview</h2>
              </div>

              <div className="fd-charts-grid">
                {/* Sales Trend Chart */}
                <div className="fd-chart-container">
                  <div className="fd-chart-title">Monthly Sales Trend</div>
                  <div className="fd-chart-subtitle">
                    Sales quantity of Fruits vs. Vegetables.
                  </div>
                  <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                      <LineChart
                        data={salesData}
                        margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          axisLine={true}
                          tickLine={false}
                          tick={{ fill: "#888", fontSize: 12 }}
                          label={{
                            value: "Month",
                            position: "insideBottom",
                            offset: -10,
                            fill: "#666",
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          axisLine={true}
                          tickLine={false}
                          tick={{ fill: "#888", fontSize: 12 }}
                          label={{
                            value: "Quantity",
                            angle: -90,
                            position: "insideLeft",
                            offset: 0,
                            fill: "#666",
                            fontSize: 12,
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend
                          className="fd-legend"
                          verticalAlign="bottom"
                          wrapperStyle={{ marginBottom: -30, marginLeft: 31 }}
                          iconType="circle"
                          formatter={(value) => (
                            <span style={{ marginRight: 10 }}>{value}</span>
                          )}
                        />

                        <Line
                          type="monotone"
                          dataKey="fruits"
                          name="Fruits"
                          stroke="#F5A623"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="vegetables"
                          name="Vegetables"
                          stroke="#1DC956"
                          strokeWidth={2}
                          dot={false}
                          wrapperStyle={{ position: "relative", right: "3rem" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Demand Products Chart */}
                <div className="fd-chart-container">
                  <div className="fd-chart-title">Highest Demand Products</div>
                  <div className="fd-chart-subtitle">
                    Top demanded vegetables and fruits by quantity.
                  </div>
                  <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart
                        layout="vertical"
                        data={demandData}
                        margin={{ top: 5, right: 30, left: 10, bottom: 30 }}
                      >
                        <XAxis
                          type="number"
                          axisLine={true}
                          tickLine={false}
                          tick={{ fill: "#888", fontSize: 12 }}
                          label={{
                            value: "Quantity",
                            position: "insideBottom",
                            offset: -10,
                            fill: "#666",
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#555", fontSize: 12 }}
                          width={100}
                        />
                        <Tooltip
                          cursor={{ fill: "transparent" }}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#1DC956"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeView === "products" && (
          <ProductManagement onAddProduct={() => setActiveView("addProduct")} />
        )}

        {activeView === "addProduct" && (
          <AddProductView onBack={() => setActiveView("products")} />
        )}

        {activeView === "orders" && (
          <OrderManagement onViewOrder={() => setActiveView("orderDetail")} />
        )}

        {activeView === "orderDetail" && (
          <OrderDetailView onBack={() => setActiveView("orders")} />
        )}

        {activeView === "analytics" && <DetailedAnalytics />}

        {activeView === "settings" && <SettingsView />}

        {activeView === "notifications" && <NotificationsView />}

        {activeView === "chat" && <ChatView />}
      </main>

      {/* Footer */}
      <footer className="fd-main-content fd-footer">
        <div className="fd-footer-text">
          &copy; {new Date().getFullYear()} AgroMart. All rights reserved.
        </div>
        <div className="fd-socials">
          <FaFacebookF />
          <FaTwitter />
          <FaLinkedinIn />
        </div>
      </footer>

      {isChatPopupOpen && (
        <div className="chat-popup-overlay">
          <div className="chat-popup-content">
            <ChatView onClose={() => setIsChatPopupOpen(false)} />
          </div>
        </div>
      )}

      <div className="chat-fab" onClick={() => setIsChatPopupOpen(!isChatPopupOpen)} style={{ cursor: "pointer" }}>
        <FaCommentDots />
      </div>
    </div>

  );
};

export default FarmerDashboard;
