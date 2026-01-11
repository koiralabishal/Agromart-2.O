import React, { useState, useEffect } from "react";
import {
  FaLeaf,
  FaHome,
  FaUsers,
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
  FaBoxes,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import api from "../../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import CollectorsView from "./CollectorsView";
import CollectorProductView from "./CollectorProductView";
import InventoryManagement from "./InventoryManagement";
import SupplierAddInventoryView from "./SupplierAddInventoryView";
import OrderManagement from "./OrderManagement";
import OrderDetailView from "./OrderDetailView";
import DetailedAnalytics from "./DetailedAnalytics";
import SettingsView from "./SettingsView";
import NotificationsView from "./NotificationsView";
import ChatView from "./ChatView";
import CartView from "./CartView";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./Styles/SupplierDashboard.css";

const SupplierDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(
    sessionStorage.getItem("supplierActiveView") || "dashboard"
  );
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem("supplierCartItems");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing cartItems", e);
      return [];
    }
  });
  const [hasViewedCart, setHasViewedCart] = useState(() => {
    return sessionStorage.getItem("supplierHasViewedCart") === "true";
  });
  const [selectedCollector, setSelectedCollector] = useState(() => {
    try {
      const saved = sessionStorage.getItem("selectedCollector");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing selectedCollector", e);
      return null;
    }
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderType, setOrderType] = useState("received");
  const [inventorySubView, setInventorySubView] = useState("list");
  const [inventoryState, setInventoryState] = useState(null);
  const [preFetchedCollectors, setPreFetchedCollectors] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || { name: "John Doe" };
  const navigate = useNavigate();

  // Background data fetching for high performance
  const fetchDashboardData = async () => {
    try {
      // Parallel fetch for speed
      const [invRes, collRes] = await Promise.all([
        api.get(`/inventory?userID=${user._id || user.id}`),
        api.get("/users/active-collectors"),
      ]);

      setInventoryState(invRes.data);
      localStorage.setItem(
        "supplierInventory_cache",
        JSON.stringify(invRes.data)
      );

      setPreFetchedCollectors(collRes.data);
      localStorage.setItem(
        "cached_active_collectors",
        JSON.stringify(collRes.data)
      );

      console.log(">>> Supplier Dashboard data pre-fetched and cached");
    } catch (err) {
      console.error("Error pre-fetching supplier data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user._id, user.id]);

  useEffect(() => {
    sessionStorage.setItem("supplierActiveView", activeView);
    sessionStorage.setItem("supplierCartItems", JSON.stringify(cartItems));
    sessionStorage.setItem("supplierHasViewedCart", hasViewedCart);
    if (selectedCollector) {
      sessionStorage.setItem(
        "selectedCollector",
        JSON.stringify(selectedCollector)
      );
    } else {
      sessionStorage.removeItem("selectedCollector");
    }
  }, [activeView, selectedCollector, cartItems]);

  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    setHasViewedCart(false);
  };

  const handleUpdateQuantity = (id, delta) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const cartCount = cartItems.length;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      sessionStorage.removeItem("supplierActiveView");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.removeItem("user");
      sessionStorage.removeItem("supplierActiveView");
      navigate("/");
    }
  };

  const handleViewOrder = (order, type) => {
    setSelectedOrder(order);
    setOrderType(type);
    setActiveView("orderDetail");
  };

  const handleViewProfile = (collector) => {
    setSelectedCollector(collector);
    setActiveView("collectorProduct");
  };

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
    <div className="supplier-dashboard-container">
      {/* Header */}
      <header className="sd-header">
        <div className="sd-logo">
          <FaLeaf /> <span>AgroMart</span>
        </div>

        <nav className={`sd-nav ${isSidebarOpen ? "sidebar-open" : ""}`}>
          <div className="sd-mobile-logo">
            <FaLeaf /> <span>AgroMart</span>
          </div>
          <div
            className={`sd-nav-item ${
              activeView === "dashboard" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("dashboard");
              setSelectedCollector(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaHome /> Dashboard
          </div>
          <div
            className={`sd-nav-item ${
              activeView === "collectors" || activeView === "collectorProduct"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveView("collectors");
              setSelectedCollector(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaUsers /> Collectors
          </div>
          <div
            className={`sd-nav-item ${
              activeView === "orders" || activeView === "orderDetail"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveView("orders");
              setSelectedCollector(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaShoppingCart /> Orders
          </div>
          <div
            className={`sd-nav-item ${
              activeView === "analytics" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("analytics");
              setSelectedCollector(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaChartBar /> Analytics
          </div>
          <div
            className={`sd-nav-item ${
              activeView === "inventory" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("inventory");
              setSelectedCollector(null);
              setInventorySubView("list");
              setIsSidebarOpen(false);
            }}
          >
            <FaBoxes /> Inventory
          </div>
          <div
            className={`sd-nav-item ${
              activeView === "settings" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("settings");
              setSelectedCollector(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaCog /> Settings
          </div>
        </nav>

        <div className="sd-profile-actions">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div
            className="sd-icon-btn cart-icon-wrapper"
            onClick={() => {
              setActiveView("cart");
              setHasViewedCart(true);
            }}
            title="Cart"
            style={{
              cursor: "pointer",
              color: activeView === "cart" ? "#1dc956" : "inherit",
              position: "relative",
            }}
          >
            <FaShoppingCart />
            {cartCount > 0 && !hasViewedCart && (
              <span className="cart-counter">{cartCount}</span>
            )}
          </div>

          <div
            className="sd-icon-btn"
            onClick={() => setActiveView("notifications")}
            style={{
              cursor: "pointer",
              color: activeView === "notifications" ? "#1dc956" : "inherit",
              position: "relative",
            }}
            title="Notifications"
          >
            <FaBell />
            <span className="notif-counter">2</span>
          </div>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="Profile"
            className="sd-profile-pic"
          />
          <div className="sd-icon-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="sd-main-content">
        {activeView === "dashboard" && (
          <>
            <section className="sd-hero">
              <h1>Welcome To AgroMart, {user.name}!</h1>
              <p>Manage your supply chain, inventory and orders efficiently.</p>
            </section>

            <section className="sd-stats-grid">
              <div className="sd-stat-card sd-card-green">
                <div className="sd-stat-header">
                  <span className="sd-stat-title">Total Purchases</span>
                  <TbCurrencyRupeeNepalese className="sd-stat-icon" />
                </div>
                <div className="sd-stat-value">Rs. 45,800</div>
                <div className="sd-stat-footer">Up 15% from last month</div>
              </div>

              <div className="sd-stat-card sd-card-yellow">
                <div className="sd-stat-header">
                  <span className="sd-stat-title">Active Orders</span>
                  <FaShoppingCart className="sd-stat-icon" />
                </div>
                <div className="sd-stat-value">8</div>
                <div className="sd-stat-footer">In transit or pending</div>
              </div>

              <div className="sd-stat-card sd-card-light-green">
                <div className="sd-stat-header">
                  <span className="sd-stat-title">Inventory Items</span>
                  <FaBoxes className="sd-stat-icon" />
                </div>
                <div className="sd-stat-value">24</div>
                <div className="sd-stat-footer">Across 5 categories</div>
              </div>

              <div className="sd-stat-card sd-card-green">
                <div className="sd-stat-header">
                  <span className="sd-stat-title">Supplier Rating</span>
                  <FaStar className="sd-stat-icon" />
                </div>
                <div className="sd-stat-value">4.9/5</div>
                <div className="sd-stat-footer">Top rated supplier</div>
              </div>
            </section>

            <section className="sd-analytics">
              <div className="sd-analytics-header">
                <h2>Supply Overview</h2>
              </div>
              <div className="sd-charts-grid">
                <div className="sd-chart-container">
                  <div className="sd-chart-title">Purchase Trends</div>
                  <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                      <LineChart
                        data={salesData}
                        margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#888", fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: "#888", fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="fruits"
                          stroke="#F5A623"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="vegetables"
                          stroke="#1DC956"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="sd-chart-container">
                  <div className="sd-chart-title">Top 5 Demanded Items</div>
                  <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart
                        layout="vertical"
                        data={demandData.slice(0, 5)}
                        margin={{ top: 5, right: 30, left: 10, bottom: 30 }}
                      >
                        <XAxis
                          type="number"
                          tick={{ fill: "#888", fontSize: 12 }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#555", fontSize: 12 }}
                          width={100}
                        />
                        <Tooltip cursor={{ fill: "transparent" }} />
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

        {activeView === "collectors" && (
          <div className="collectors-view-wrapper">
            <CollectorsView 
              onViewProfile={handleViewProfile} 
              preFetchedCollectors={preFetchedCollectors}
            />
          </div>
        )}
        {activeView === "collectorProduct" && selectedCollector && (
          <CollectorProductView
            collector={selectedCollector}
            onBack={() => setActiveView("collectors")}
            onAddToCart={handleAddToCart}
          />
        )}
        {activeView === "inventory" &&
          (inventorySubView === "list" ? (
            <InventoryManagement
              onAddInventory={() => setInventorySubView("add")}
              initialData={inventoryState}
              onRefresh={fetchDashboardData}
            />
          ) : (
            <SupplierAddInventoryView
              onBack={() => setInventorySubView("list")}
              onItemAdded={fetchDashboardData}
            />
          ))}
        {activeView === "orders" && (
          <OrderManagement onViewOrder={handleViewOrder} />
        )}
        {activeView === "orderDetail" && (
          <OrderDetailView
            order={selectedOrder}
            orderType={orderType}
            onBack={() => setActiveView("orders")}
          />
        )}
        {activeView === "analytics" && <DetailedAnalytics />}
        {activeView === "settings" && <SettingsView />}
        {activeView === "notifications" && <NotificationsView />}
        {activeView === "cart" && (
          <CartView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onBack={() => setActiveView("collectors")}
          />
        )}
        {activeView === "chat" && <ChatView />}
      </main>

      <footer className="sd-footer">
        <div className="sd-footer-text">
          &copy; {new Date().getFullYear()} AgroMart. All rights reserved.
        </div>
        <div className="sd-socials">
          <FaFacebookF /> <FaTwitter /> <FaLinkedinIn />
        </div>
      </footer>

      {isChatPopupOpen && (
        <div className="chat-popup-overlay">
          <div className="chat-popup-content">
            <ChatView onClose={() => setIsChatPopupOpen(false)} />
          </div>
        </div>
      )}
      <div
        className="chat-fab"
        onClick={() => setIsChatPopupOpen(!isChatPopupOpen)}
      >
        <FaCommentDots />
      </div>
    </div>
  );
};

export default SupplierDashboard;
