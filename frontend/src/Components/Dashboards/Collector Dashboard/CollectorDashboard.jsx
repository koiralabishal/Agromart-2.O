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
import { useNavigate } from "react-router-dom";
import FarmersView from "./FarmersView";
import FarmerProductView from "./FarmerProductView";
import InventoryManagement from "./InventoryManagement";
import AddInventoryView from "./AddInventoryView";
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
import "./Styles/CollectorDashboard.css";

import api from "../../../api/axiosConfig";

const CollectorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(
    sessionStorage.getItem("collectorActiveView") || "dashboard"
  );
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem("cartItems");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing cartItems", e);
      return [];
    }
  });
  const [hasViewedCart, setHasViewedCart] = useState(() => {
    return sessionStorage.getItem("hasViewedCart") === "true";
  });
  const [selectedFarmer, setSelectedFarmer] = useState(() => {
    try {
      const saved = sessionStorage.getItem("selectedFarmer");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing selectedFarmer", e);
      return null;
    }
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderType, setOrderType] = useState("received");
  const [inventorySubView, setInventorySubView] = useState("list");
  const [preFetchedFarmers, setPreFetchedFarmers] = useState(null);
  
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || { name: "John Doe" });
  const userID = user?._id || user?.id;
  const navigate = useNavigate();

  // Sync user state from localStorage and background fetch
  useEffect(() => {
    const handleSync = () => {
      setUser(JSON.parse(localStorage.getItem("user")) || { name: "John Doe" });
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('userUpdated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('userUpdated', handleSync);
    };
  }, []);

  // Background data fetching for high performance (Zero-Loading feel)
  useEffect(() => {
    const preFetchDashboardData = async () => {
      if (!userID || userID === 'admin-id') return;
      
      try {
        // Parallel fetch for speed
        const [farmersRes, profileRes] = await Promise.all([
          api.get("/users/active-farmers"),
          api.get(`/users/profile/${userID}`)
        ]);

        // 1. Handle Farmers Data
        setPreFetchedFarmers(farmersRes.data);
        localStorage.setItem("cached_active_farmers", JSON.stringify(farmersRes.data));

        // 2. Handle Profile Sync
        const updatedUser = { ...user, ...profileRes.data };
        if (updatedUser.profileImage) {
          const img = new Image();
          img.src = updatedUser.profileImage;
        }
        if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }

        console.log(">>> Collector Dashboard data pre-fetched and cached");
      } catch (err) {
        console.error("Error pre-fetching collector data:", err);
      }
    };
    
    preFetchDashboardData();
  }, [userID]);

  useEffect(() => {
    sessionStorage.setItem("collectorActiveView", activeView);
    sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
    sessionStorage.setItem("hasViewedCart", hasViewedCart);
    if (selectedFarmer) {
      sessionStorage.setItem("selectedFarmer", JSON.stringify(selectedFarmer));
    } else {
      sessionStorage.removeItem("selectedFarmer");
    }
  }, [activeView, selectedFarmer, cartItems]);

  const handleAddToCart = async (product) => {
    const productId = product._id || product.id;
    try {
      // 1. Update database quantity (decrease by 1)
      await api.patch(`/products/${productId}/quantity`, { delta: -1 });

      // 2. Update local cart state
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => (item._id || item.id) === productId
        );
        if (existingItem) {
          return prevItems.map((item) =>
            (item._id || item.id) === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prevItems, { ...product, quantity: 1 }];
        }
      });
      setHasViewedCart(false);
      console.log(`>>> Database updated: ${product.productName} quantity decreased by 1`);
    } catch (err) {
      console.error("Failed to update database quantity on add:", err);
      alert(err.response?.data?.message || "Failed to update stock. Please try again.");
    }
  };

  const handleUpdateQuantity = async (id, delta) => {
    try {
      // 1. Update database quantity (delta is what changes for the cart, so inverse for DB)
      // If cart increases (+1), DB decreases (-1). If cart decreases (-1), DB increases (+1).
      await api.patch(`/products/${id}/quantity`, { delta: -delta });

      // 2. Update local cart state
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          (item.id === id || item._id === id)
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
      );
      console.log(`>>> Database updated: product ${id} quantity changed by ${-delta}`);
    } catch (err) {
      console.error("Failed to update database quantity on update:", err);
      alert(err.response?.data?.message || "Failed to update stock. Please try again.");
    }
  };

  const handleRemoveItem = async (id) => {
    const itemToRemove = cartItems.find(item => (item._id || item.id) === id);
    if (!itemToRemove) return;

    try {
      // 1. Update database quantity (increase by the total amount that was in cart)
      await api.patch(`/products/${id}/quantity`, { delta: itemToRemove.quantity });

      // 2. Update local cart state
      setCartItems((prevItems) => prevItems.filter((item) => (item._id || item.id) !== id));
      console.log(`>>> Database updated: ${itemToRemove.productName || itemToRemove.name} quantity restored by ${itemToRemove.quantity}`);
    } catch (err) {
      console.error("Failed to update database quantity on remove:", err);
      // We still remove it from cart locally to avoid blocking user, but log error
      setCartItems((prevItems) => prevItems.filter((item) => (item._id || item.id) !== id));
    }
  };

  const cartCount = cartItems.length;


  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("user");
      sessionStorage.removeItem("collectorActiveView");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.removeItem("user");
      sessionStorage.removeItem("collectorActiveView");
      navigate("/");
    }
  };

  const handleViewOrder = (order, type) => {
    setSelectedOrder(order);
    setOrderType(type);
    setActiveView("orderDetail");
  };

  const handleViewProfile = (farmer) => {
    setSelectedFarmer(farmer);
    setActiveView("farmerProduct");
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
    <div className="collector-dashboard-container">
      {/* Header */}
      <header className="cd-header">
        <div className="cd-logo">
          <FaLeaf /> <span>AgroMart</span>
        </div>

        <nav className={`cd-nav ${isSidebarOpen ? "sidebar-open" : ""}`}>
          <div className="cd-mobile-logo">
            <FaLeaf /> <span>AgroMart</span>
          </div>
          <div
            className={`cd-nav-item ${
              activeView === "dashboard" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("dashboard");
              setSelectedFarmer(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaHome /> Dashboard
          </div>
          <div
            className={`cd-nav-item ${
              activeView === "farmers" || activeView === "farmerProduct"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveView("farmers");
              setSelectedFarmer(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaUsers /> Farmers
          </div>
          <div
            className={`cd-nav-item ${
              activeView === "orders" || activeView === "orderDetail"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveView("orders");
              setSelectedFarmer(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaShoppingCart /> Orders
          </div>
          <div
            className={`cd-nav-item ${
              activeView === "analytics" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("analytics");
              setSelectedFarmer(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaChartBar /> Analytics
          </div>
          <div
            className={`cd-nav-item ${
              activeView === "inventory" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("inventory");
              setSelectedFarmer(null);
              setInventorySubView("list");
              setIsSidebarOpen(false);
            }}
          >
            <FaBoxes /> Inventory
          </div>
          <div
            className={`cd-nav-item ${
              activeView === "settings" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("settings");
              setSelectedFarmer(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaCog /> Settings
          </div>
        </nav>

        <div className="cd-profile-actions">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div
            className="cd-icon-btn cart-icon-wrapper"
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
            className="cd-icon-btn"
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
            src={user.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn"}
            alt="Profile"
            className="cd-profile-pic"
          />
          <div className="cd-icon-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="cd-main-content">
        {activeView === "dashboard" && (
          <>
            <section className="cd-hero">
              <h1>Welcome To AgroMart, {user.name}!</h1>
              <p>Manage your collection, inventory and orders efficiently.</p>
            </section>

            <section className="cd-stats-grid">
              <div className="cd-stat-card cd-card-green">
                <div className="cd-stat-header">
                  <span className="cd-stat-title">Total Purchases</span>
                  <TbCurrencyRupeeNepalese className="cd-stat-icon" />
                </div>
                <div className="cd-stat-value">Rs. 45,800</div>
                <div className="cd-stat-footer">Up 15% from last month</div>
              </div>

              <div className="cd-stat-card cd-card-yellow">
                <div className="cd-stat-header">
                  <span className="cd-stat-title">Active Orders</span>
                  <FaShoppingCart className="cd-stat-icon" />
                </div>
                <div className="cd-stat-value">8</div>
                <div className="cd-stat-footer">In transit or pending</div>
              </div>

              <div className="cd-stat-card cd-card-light-green">
                <div className="cd-stat-header">
                  <span className="cd-stat-title">Inventory Items</span>
                  <FaBoxes className="cd-stat-icon" />
                </div>
                <div className="cd-stat-value">24</div>
                <div className="cd-stat-footer">Across 5 categories</div>
              </div>

              <div className="cd-stat-card cd-card-green">
                <div className="cd-stat-header">
                  <span className="cd-stat-title">Collector Rating</span>
                  <FaStar className="cd-stat-icon" />
                </div>
                <div className="cd-stat-value">4.9/5</div>
                <div className="cd-stat-footer">Top rated collector</div>
              </div>
            </section>

            <section className="cd-analytics">
              <div className="cd-analytics-header">
                <h2>Collection Overview</h2>
              </div>
              <div className="cd-charts-grid">
                <div className="cd-chart-container">
                  <div className="cd-chart-title">Purchase Trends</div>
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
                <div className="cd-chart-container">
                  <div className="cd-chart-title">Top 5 Demanded Items</div>
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

        {activeView === "farmers" && (
          <div className="farmers-view-wrapper">
            <FarmersView
              onViewProfile={handleViewProfile}
              preFetchedFarmers={preFetchedFarmers}
            />
          </div>
        )}
        {activeView === "farmerProduct" && selectedFarmer && (
          <FarmerProductView
            farmer={selectedFarmer}
            onBack={() => setActiveView("farmers")}
            onAddToCart={handleAddToCart}
          />
        )}
        {activeView === "inventory" &&
          (inventorySubView === "list" ? (
            <InventoryManagement
              onAddInventory={() => setInventorySubView("add")}
            />
          ) : (
            <AddInventoryView onBack={() => setInventorySubView("list")} />
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
            onBack={() => setActiveView("farmers")}
          />
        )}
        {activeView === "chat" && <ChatView />}
      </main>

      <footer className="cd-footer">
        <div className="cd-footer-text">
          &copy; {new Date().getFullYear()} AgroMart. All rights reserved.
        </div>
        <div className="cd-socials">
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

export default CollectorDashboard;
