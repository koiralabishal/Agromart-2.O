import React, { useState, useEffect } from "react";
import {
  FaLeaf,
  FaHome,
  FaUsers,
  FaShoppingCart,
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaCommentDots,
  FaBars,
  FaTimes,
  FaList,
  FaTruck,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosConfig";
import DistributorsView from "./DistributorsView";
import DistributorProductView from "./DistributorProductView";
import BuyerOrderManagement from "./BuyerOrderManagement";
import BuyerOrderDetailView from "./BuyerOrderDetailView";
import SettingsView from "./SettingsView";
import BuyerNotificationsView from "./BuyerNotificationsView";
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
import "./Styles/BuyerDashboard.css";

const BuyerDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(
    sessionStorage.getItem("buyerActiveView") || "dashboard"
  );
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem("buyerCartItems");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing cartItems", e);
      return [];
    }
  });
  const [hasViewedCart, setHasViewedCart] = useState(() => {
    return sessionStorage.getItem("buyerHasViewedCart") === "true";
  });
  const [selectedDistributor, setSelectedDistributor] = useState(() => {
    try {
      const saved = sessionStorage.getItem("selectedDistributor");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing selectedDistributor", e);
      return null;
    }
  });
  const [selectedOrder, setSelectedOrder] = useState(() => {
    try {
      const saved = sessionStorage.getItem("selectedOrder");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing selectedOrder", e);
      return null;
    }
  });
  const [spendingPeriod, setSpendingPeriod] = useState("monthly");
  const [preFetchedDistributors, setPreFetchedDistributors] = useState(null);
  
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
        const [distRes, profileRes] = await Promise.all([
          api.get("/users/active-distributors"),
          api.get(`/users/profile/${userID}`)
        ]);

        // 1. Handle Distributors Data
        setPreFetchedDistributors(distRes.data);
        localStorage.setItem("cached_active_distributors", JSON.stringify(distRes.data));

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

        console.log(">>> Buyer Dashboard data pre-fetched and cached");
      } catch (err) {
        console.error("Error pre-fetching buyer data:", err);
      }
    };
    
    preFetchDashboardData();
  }, [userID]);

  useEffect(() => {
    sessionStorage.setItem("buyerActiveView", activeView);
    sessionStorage.setItem("buyerCartItems", JSON.stringify(cartItems));
    sessionStorage.setItem("buyerHasViewedCart", hasViewedCart);
    if (selectedDistributor) {
      sessionStorage.setItem(
        "selectedDistributor",
        JSON.stringify(selectedDistributor)
      );
    } else {
      sessionStorage.removeItem("selectedDistributor");
    }

    if (selectedOrder) {
      sessionStorage.setItem("selectedOrder", JSON.stringify(selectedOrder));
    } else {
      sessionStorage.removeItem("selectedOrder");
    }
  }, [activeView, selectedDistributor, selectedOrder, cartItems]);

  const handleAddToCart = async (product) => {
    const productId = product._id || product.id;
    try {
      // 1. Update database inventory quantity (decrease by 1)
      await api.patch(`/inventory/${productId}/quantity`, { delta: -1 });

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
      console.log(`>>> Inventory updated: ${product.productName} quantity decreased by 1`);
    } catch (err) {
      console.error("Failed to update inventory quantity on add:", err);
      alert(err.response?.data?.message || "Failed to update stock. Please try again.");
    }
  };

  const handleUpdateQuantity = async (id, delta) => {
    try {
      // 1. Update database inventory quantity (delta is what changes for the cart, so inverse for DB)
      // If cart increases (+1), DB decreases (-1). If cart decreases (-1), DB increases (+1).
      await api.patch(`/inventory/${id}/quantity`, { delta: -delta });

      // 2. Update local cart state
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          (item.id === id || item._id === id)
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
      );
      console.log(`>>> Inventory updated: ID ${id} quantity changed by ${-delta}`);
    } catch (err) {
      console.error("Failed to update inventory quantity on change:", err);
      alert(err.response?.data?.message || "Failed to update stock. Please try again.");
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      // 1. Find the item in cart to get its quantity
      const itemToRemove = cartItems.find((item) => (item.id === id || item._id === id));
      if (!itemToRemove) return;

      // 2. Return total quantity back to inventory
      await api.patch(`/inventory/${id}/quantity`, {
        delta: itemToRemove.quantity,
      });

      // 3. Update local cart state
      setCartItems((prevItems) => prevItems.filter((item) => (item.id !== id && item._id !== id)));
      console.log(`>>> Inventory updated: ID ${id} restored ${itemToRemove.quantity} units`);
    } catch (err) {
      console.error("Failed to update inventory quantity on remove:", err);
      alert(err.response?.data?.message || "Failed to update stock. Please try again.");
    }
  };

  const cartCount = cartItems.length;


  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("user");
      sessionStorage.removeItem("buyerActiveView");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.removeItem("user");
      sessionStorage.removeItem("buyerActiveView");
      navigate("/");
    }
  };

  const handleViewOrder = (order, type) => {
    setSelectedOrder(order);
    setActiveView("orderDetail");
  };

  const handleViewProfile = (distributor) => {
    setSelectedDistributor(distributor);
    setActiveView("distributorProduct");
  };

  // Monthly Buys Trend data
  const monthlyBuysData = [
    { name: "Feb", vegetables: 150, fruits: 120 },
    { name: "Apr", vegetables: 220, fruits: 180 },
    { name: "Jun", vegetables: 280, fruits: 210 },
    { name: "Aug", vegetables: 310, fruits: 240 },
    { name: "Oct", vegetables: 290, fruits: 220 },
    { name: "Dec", vegetables: 320, fruits: 260 },
  ];

  // High Order Products data
  const highOrderProducts = [
    { name: "Tomatoes", orders: 520 },
    { name: "Potatoes", orders: 480 },
    { name: "Onions", orders: 450 },
    { name: "Carrots", orders: 380 },
    { name: "Cabbage", orders: 320 },
    { name: "Spinach", orders: 280 },
    { name: "Lettuce", orders: 210 },
  ];

  return (
    <div className="buyer-dashboard-container">
      {/* Header */}
      <header className="bd-header">
        <div className="bd-logo">
          <FaLeaf /> <span>AgroMart</span>
        </div>

        <nav className={`bd-nav ${isSidebarOpen ? "sidebar-open" : ""}`}>
          <div className="bd-mobile-logo">
            <FaLeaf /> <span>AgroMart</span>
          </div>
          <div
            className={`bd-nav-item ${
              activeView === "dashboard" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("dashboard");
              setSelectedDistributor(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaHome /> Dashboard
          </div>
          <div
            className={`bd-nav-item ${
              activeView === "distributors" ||
              activeView === "distributorProduct"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveView("distributors");
              setSelectedDistributor(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaUsers /> Distributors
          </div>
          <div
            className={`bd-nav-item ${
              activeView === "orders" || activeView === "orderDetail"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveView("orders");
              setSelectedDistributor(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaShoppingCart /> Orders
          </div>
          <div
            className={`bd-nav-item ${
              activeView === "settings" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("settings");
              setSelectedDistributor(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaCog /> Settings
          </div>
        </nav>

        <div className="bd-profile-actions">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div
            className="bd-icon-btn cart-icon-wrapper"
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
            className="bd-icon-btn"
            onClick={() => setActiveView("notifications")}
            style={{
              cursor: "pointer",
              color: activeView === "notifications" ? "#1dc956" : "inherit",
              position: "relative",
            }}
            title="Notifications"
          >
            <FaBell />
            <span className="notif-counter">3</span>
          </div>
          <img
            src={user.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn"}
            alt="Profile"
            className="bd-profile-pic"
          />
          <div className="bd-icon-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bd-main-content">
        {activeView === "dashboard" && (
          <>
            <section className="bd-hero">
              <h1>Welcome To AgroMart, {user.name}!</h1>
              <p>
                Here's an overview of your buying performance and operations.
              </p>
            </section>

            {/* Stats Grid */}
            <section className="bd-stats-grid">
              <div className="bd-stat-card bd-card-green">
                <div className="bd-stat-header">
                  <span className="bd-stat-title">Total Orders This Month</span>
                  <FaList className="bd-stat-icon" />
                </div>
                <div className="bd-stat-value">2,450</div>
                <div className="bd-stat-footer">+18% from last month</div>
              </div>

              <div className="bd-stat-card bd-card-yellow">
                <div className="bd-stat-header">
                  <span className="bd-stat-title">Active Orders</span>
                  <FaShoppingCart className="bd-stat-icon" />
                </div>
                <div className="bd-stat-value">12</div>
                <div className="bd-stat-footer">Currently being processed</div>
              </div>

              <div className="bd-stat-card bd-card-orange">
                <div className="bd-stat-header">
                  <span className="bd-stat-title">Pending Deliveries</span>
                  <FaTruck className="bd-stat-icon" />
                </div>
                <div className="bd-stat-value">5</div>
                <div className="bd-stat-footer">Awaiting your receipt</div>
              </div>

              {/* <div className="bd-stat-card bd-card-blue">
                <div className="bd-stat-header">
                  <span className="bd-stat-title">
                    Available Distributors Nearby
                  </span>
                  <FaUsers className="bd-stat-icon" />
                </div>
                <div className="bd-stat-value">8</div>
              </div> */}

              <div className="bd-stat-card bd-spending-card bd-card-light-green">
                <div className="bd-stat-header">
                  <span className="bd-stat-title">Total Spending</span>
                  <div className="bd-toggle-buttons">
                    <button
                      className={spendingPeriod === "monthly" ? "active" : ""}
                      onClick={() => setSpendingPeriod("monthly")}
                    >
                      Monthly
                    </button>
                    <button
                      className={spendingPeriod === "weekly" ? "active" : ""}
                      onClick={() => setSpendingPeriod("weekly")}
                    >
                      Weekly
                    </button>
                  </div>
                </div>
                <div className="bd-stat-value">Rs. 8,200</div>
                <div className="bd-stat-footer">Based on selected period</div>
              </div>
            </section>

            {/* Analytics Overview */}
            <section className="bd-analytics">
              <div className="bd-analytics-header">
                <h2>Analytics Overview</h2>
              </div>
              <div className="bd-charts-grid">
                <div className="bd-chart-container">
                  <div className="bd-chart-title">Monthly Buys Trend</div>
                  <p className="bd-chart-subtitle">
                    Quantity of vegetables and fruits purchased over the last
                    year.
                  </p>
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart
                        data={monthlyBuysData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e5e7eb"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#888", fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: "#888", fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="vegetables"
                          stroke="#1DC956"
                          strokeWidth={2}
                          dot={false}
                          name="Vegetables"
                        />
                        <Line
                          type="monotone"
                          dataKey="fruits"
                          stroke="#F5A623"
                          strokeWidth={2}
                          dot={false}
                          name="Fruits"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bd-chart-container">
                  <div className="bd-chart-title">High Order Products</div>
                  <p className="bd-chart-subtitle">
                    Your top purchased products by quantity.
                  </p>
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart
                        layout="vertical"
                        data={highOrderProducts}
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
                          dataKey="orders"
                          fill="#1DC956"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                          name="Orders"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeView === "distributors" && (
          <div className="distributors-view-wrapper">
            <DistributorsView 
              onViewProfile={handleViewProfile} 
              preFetchedDistributors={preFetchedDistributors}
            />
          </div>
        )}
        {activeView === "distributorProduct" && selectedDistributor && (
          <DistributorProductView
            distributor={selectedDistributor}
            onBack={() => setActiveView("distributors")}
            onAddToCart={handleAddToCart}
          />
        )}
        {activeView === "orders" && (
          <BuyerOrderManagement onViewOrder={handleViewOrder} />
        )}
        {activeView === "orderDetail" && selectedOrder && (
          <BuyerOrderDetailView
            order={selectedOrder}
            orderType="placed"
            onBack={() => setActiveView("orders")}
          />
        )}
        {activeView === "settings" && <SettingsView />}
        {activeView === "notifications" && <BuyerNotificationsView />}
        {activeView === "cart" && (
          <CartView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onBack={() => setActiveView("distributors")}
          />
        )}
        {activeView === "chat" && <ChatView />}
      </main>

      <footer className="bd-footer">
        <div className="bd-footer-text">
          &copy; {new Date().getFullYear()} AgroMart. All rights reserved.
        </div>
        <div className="bd-socials">
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

export default BuyerDashboard;
