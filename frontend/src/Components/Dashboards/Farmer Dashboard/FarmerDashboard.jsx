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
  FaUser,
  FaEnvelope,
  FaWallet,
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
import PaymentsView from "./PaymentsView";
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

import api from "../../../api/axiosConfig";

const FarmerDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(
    sessionStorage.getItem("farmerActiveView") || "dashboard"
  );
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [preFetchedProducts, setPreFetchedProducts] = useState(null);
  const [loading, setLoading] = useState(true); // Default to loading on mount
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || { name: "John Doe" }
  );
  const userID = user?._id || user?.id;

  const [orders, setOrders] = useState(() => {
    try {
      const saved = sessionStorage.getItem("farmerOrdersReceived");
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [wallet, setWallet] = useState(() => {
    try {
      const id = JSON.parse(localStorage.getItem("user"))?._id;
      const saved = localStorage.getItem(`cached_farmer_wallet_${id}`);
      return saved ? JSON.parse(saved).wallet : null;
    } catch (e) { return null; }
  });
  const [walletData, setWalletData] = useState(() => {
    try {
      const id = JSON.parse(localStorage.getItem("user"))?._id;
      const saved = localStorage.getItem(`cached_farmer_wallet_${id}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  const [selectedOrder, setSelectedOrder] = useState(() => {
    try {
      const saved = sessionStorage.getItem("selectedOrder");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });


  // Sync user from localStorage if it changes (e.g., from SettingsView)
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")) || { name: "John Doe" });
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleStorageChange);
    };
  }, []);

  // Sync user state when activeView changes to catch local updates
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")) || { name: "John Doe" });
  }, [activeView]);

  // Fetch latest profile, products, wallet, and orders from database on mount (Zero-Loading Pattern)
  useEffect(() => {
    const preFetchDashboardData = async () => {
      if (!userID || userID === "admin-id") {
          setLoading(false);
          return;
      }

      setLoading(true); // Start loading fresh data
      try {
        // Parallel fetch for high performance (resilient to individual failures)
        const results = await Promise.allSettled([
          api.get(`/users/profile/${userID}`),
          api.get("/products", { params: { userID } }),
          api.get(`/wallet/${userID}`),
          api.get("/orders", { params: { userID, role: "seller" } })
        ]);

        const [profileRes, productsRes, walletRes, ordersRes] = results;

        // 1. Handle Profile
        if (profileRes.status === 'fulfilled') {
            const profileData = profileRes.value.data;
            const updatedUser = { ...user, ...profileData };
            if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } else {
            console.error("Profile fetch failed:", profileRes.reason);
        }

        // 2. Handle Products
        if (productsRes.status === 'fulfilled') {
            setPreFetchedProducts(productsRes.value.data);
            localStorage.setItem(`cached_farmer_products_${userID}`, JSON.stringify(productsRes.value.data));
        } else {
            console.error("Products fetch failed:", productsRes.reason);
        }

        // 3. Handle Wallet
        if (walletRes.status === 'fulfilled') {
            setWallet(walletRes.value.data.wallet);
            setWalletData(walletRes.value.data); 
            localStorage.setItem(`cached_farmer_wallet_${userID}`, JSON.stringify(walletRes.value.data));
        } else {
            console.error("Wallet fetch failed:", walletRes.reason);
        }

        // 4. Handle Orders
        if (ordersRes.status === 'fulfilled') {
            setOrders(ordersRes.value.data);
        } else {
            console.error("Orders fetch failed:", ordersRes.reason);
        }

        console.log(">>> Farmer Dashboard data synced from DB (Resilient)");
      } catch (err) {
        console.error("Dashboard massive sync failed:", err);
      } finally {
        setLoading(false); // Done fetching (allSettled ensures we get here)
      }
    };
    preFetchDashboardData();
  }, [userID]);

  useEffect(() => {
    sessionStorage.setItem("farmerActiveView", activeView);

    if (selectedOrder) {
      sessionStorage.setItem("selectedOrder", JSON.stringify(selectedOrder));
    } else {
      sessionStorage.removeItem("selectedOrder");
    }
  }, [activeView, selectedOrder]);

  useEffect(() => {
    if (userID) {
      const preFetch = async () => {
        try {
          const response = await api.get(`/products?userID=${userID}`);
          setPreFetchedProducts(response.data);
          localStorage.setItem(
            `cached_farmer_products_${userID}`,
            JSON.stringify(response.data)
          );
        } catch (err) {
          console.error("Pre-fetch failed", err);
        }
      };
      preFetch();
    }
  }, [userID]);

  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setActiveView("orderDetail");
  };

  const handleOrderUpdate = (updatedOrder) => {
    setSelectedOrder(updatedOrder);
  };

  // Calculate Real Stats
  // Calculate Real Stats
  const totalOnlineEarnings = Number(wallet?.totalEarnings || wallet?.totalRevenue || 0);
  
  // Robust COD Earnings Calculation (from transactions list)
  const totalCODEarnings = walletData?.codTransactions
    ? walletData.codTransactions
        .filter(t => {
           // Ensure it's a credit (received payment) and it's completed
           const isCredit = t.type === 'Credit';
           const isCompleted = t.status === 'Completed';
           return isCredit && isCompleted;
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    : 0;

  const totalRevenue = totalOnlineEarnings + totalCODEarnings;
  
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "Pending"
  ).length;

  // AOV Calculation: Revenue / (Delivered & Paid Orders)
  const finalizedOrders = orders.filter(
    (o) => o.status === "Delivered" && o.paymentStatus === "Paid"
  );
  const averageOrderValue = finalizedOrders.length > 0 
    ? (totalRevenue / finalizedOrders.length).toFixed(2) 
    : 0;

  const totalProductsSold = finalizedOrders.reduce((acc, order) => {
    return acc + order.products.reduce((sum, p) => sum + p.quantity, 0);
  }, 0);

  const totalProductsCount = preFetchedProducts ? preFetchedProducts.length : 0;

  const newProductsCount = preFetchedProducts
    ? preFetchedProducts.filter((p) => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(p.createdAt) > oneWeekAgo;
      }).length
    : 0;

  // Process Chart Data
  const processSalesData = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // Initialize data structure
    const data = months.map(name => ({
      name,
      fruits: 0,
      vegetables: 0
    }));

    orders.forEach(order => {
      // User requested: line graph only show fruits and vegetables that are successfully delivered AND paid
      if (order.status !== "Delivered" || order.paymentStatus !== "Paid") return;

      const date = new Date(order.createdAt);
      const monthIndex = date.getMonth();
      
      order.products.forEach(item => {
        // Simple categorization based on category field or fallback
        const category = item.category ? item.category.toLowerCase() : 'vegetables'; // Default to veg if unknown
        
        if (category.includes('fruit')) {
          data[monthIndex].fruits += item.quantity;
        } else {
          // Assume vegetables for others or explicit "vegetable"
          data[monthIndex].vegetables += item.quantity;
        }
      });
    });

    return data;
  };

  const processDemandData = () => {
    const productMap = {};

    orders.forEach(order => {
      // User requested: High demand includes Pending and Delivered status
      if (order.status !== "Pending" && order.status !== "Delivered") return;

      order.products.forEach(item => {
        if (productMap[item.productName]) {
          productMap[item.productName] += item.quantity;
        } else {
          productMap[item.productName] = item.quantity;
        }
      });
    });

    return Object.keys(productMap)
      .map(name => ({ name, value: productMap[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 items
  };

  const salesData = processSalesData();
  const demandData = processDemandData();

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
              activeView === "payments" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("payments");
              setIsSidebarOpen(false);
            }}
          >
            <FaWallet /> Payments
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
          <div className="fd-profile-container">
            <img
              src={
                user.profileImage ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn"
              }
              alt="Profile"
              className="fd-profile-pic"
            />
            <div className="fd-profile-tooltip">
              <div className="tooltip-item">
                <FaUser className="tooltip-icon" />
                <span>{user.name}</span>
              </div>
              <div className="tooltip-item">
                <FaEnvelope className="tooltip-icon" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
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
              {loading ? (
                // Show 4 loading cards if in loading state
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="fd-stat-card loading-skeleton">
                    <div className="skeleton-line" style={{ width: '60%', height: '20px', marginBottom: '15px' }}></div>
                    <div className="skeleton-line" style={{ width: '40%', height: '30px', marginBottom: '10px' }}></div>
                    <div className="skeleton-line" style={{ width: '80%', height: '15px' }}></div>
                  </div>
                ))
              ) : (
                <>
                  {/* Card 1: Total Sales */}
                  <div className="fd-stat-card fd-card-green">
                    <div className="fd-stat-header">
                      <span className="fd-stat-title">Total Revenues</span>
                      <TbCurrencyRupeeNepalese className="fd-stat-icon" />
                    </div>
                    <div className="fd-stat-value">
                      Rs. {totalRevenue.toLocaleString()}
                    </div>
                    <div className="fd-stat-footer">{totalProductsSold} units sold total</div>
                  </div>

                  {/* Card 2: Pending Orders */}
                  <div className="fd-stat-card fd-card-yellow">
                    <div className="fd-stat-header">
                      <span className="fd-stat-title">Pending Orders</span>
                      <FaShoppingCart className="fd-stat-icon" />
                    </div>
                    <div className="fd-stat-value">{pendingOrdersCount}</div>
                    <div className="fd-stat-footer">
                      Requiring immediate attention
                    </div>
                  </div>

                  {/* Card 3: New Products Listed */}
                  <div className="fd-stat-card fd-card-light-green">
                    <div className="fd-stat-header">
                      <span className="fd-stat-title">Total Products</span>
                      <FaBoxOpen className="fd-stat-icon" />
                    </div>
                    <div className="fd-stat-value">{totalProductsCount}</div>
                    <div className="fd-stat-footer">
                      {newProductsCount} products added in last 7 days
                    </div>
                  </div>

                  {/* Card 4: Average Order Value */}
                  <div className="fd-stat-card fd-card-green">
                    <div className="fd-stat-header">
                      <span className="fd-stat-title">Average Order Value</span>
                      <TbCurrencyRupeeNepalese className="fd-stat-icon" />
                    </div>
                    <div className="fd-stat-value">Rs. {averageOrderValue}</div>
                    <div className="fd-stat-footer">Revenue per order (approx.)</div>
                  </div>
                </>
              )}
            </section>

            {/* Analytics Section */}
            <section className="fd-analytics">
              <div className="fd-analytics-header">
                <h2>Analytics Overview</h2>
                {loading && <span style={{ fontSize: '14px', color: '#888', fontStyle: 'italic', marginLeft: '10px' }}>Syncing latest trends...</span>}
              </div>

              {loading ? (
                <div 
                  className="fd-chart-container loading-skeleton" 
                  style={{ 
                    height: '400px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#f9f9f9',
                    borderRadius: '12px',
                    border: '1px solid #eee'
                  }}
                >
                  <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #eee', borderTop: '3px solid #1dc956', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '15px' }}></div>
                  <p style={{ color: '#666' }}>Fetching your latest performance data...</p>
                </div>
              ) : (
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
                            dataKey="vegetables"
                            name="Vegetables"
                            stroke="#1dc956"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="fruits"
                            name="Fruits"
                            stroke="#f1c40f"
                            strokeWidth={2}
                            dot={false}
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
                            fill="#1dc956"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {activeView === "products" && (
          <ProductManagement
            onAddProduct={() => setActiveView("addProduct")}
            preFetchedProducts={preFetchedProducts}
          />
        )}

        {activeView === "addProduct" && (
          <AddProductView onBack={() => setActiveView("products")} />
        )}

        {activeView === "orders" && (
          <OrderManagement onViewOrder={handleViewOrder} />
        )}

        {activeView === "orderDetail" && (
          <OrderDetailView
            order={selectedOrder}
            onBack={() => setActiveView("orders")}
            onOrderUpdate={handleOrderUpdate}
          />
        )}

        {activeView === "payments" && <PaymentsView />}

        {activeView === "analytics" && (
          <DetailedAnalytics
            orders={orders}
            wallet={wallet}
            walletData={walletData}
            products={preFetchedProducts}
          />
        )}

        {activeView === "settings" && <SettingsView />}

        {activeView === "notifications" && (
          <NotificationsView orders={orders} walletData={walletData} />
        )}

        {activeView === "chat" && <ChatView />}
      </main>

      {/* Footer */}
      <footer className="footer-area">
        <div className="fd-footer">
          <div className="fd-footer-text">
            &copy; {new Date().getFullYear()} AgroMart. All rights reserved.
          </div>
          <div className="fd-socials">
            <FaFacebookF />
            <FaTwitter />
            <FaLinkedinIn />
          </div>
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
        className="chat-fab-fixed"
        onClick={() => setIsChatPopupOpen(!isChatPopupOpen)}
      >
        <FaCommentDots />
      </div>
    </div>
  );
};

export default FarmerDashboard;
