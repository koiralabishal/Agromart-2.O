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
  FaChartLine,
  FaChartPie,
  FaHistory,
  FaCheckCircle,
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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Styles/FarmerDashboard.css";

import api from "../../../api/axiosConfig";
import { useSocket } from "../../../context/SocketContext";

const FarmerDashboard = () => {
  const socket = useSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(
    sessionStorage.getItem("farmerActiveView") || "dashboard",
  );
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : { name: "John Doe" };
    } catch (e) {
      return { name: "John Doe" };
    }
  });
  const userID = user?._id || user?.id;

  const [preFetchedProducts, setPreFetchedProducts] = useState(() => {
    try {
      const saved = userID
        ? localStorage.getItem(`cached_farmer_products_${userID}`)
        : null;
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = userID
        ? localStorage.getItem(`cached_farmer_orders_${userID}`)
        : null;
      return saved ? JSON.parse(saved) : { received: [] };
    } catch (e) {
      return { received: [] };
    }
  });
  const [wallet, setWallet] = useState(() => {
    try {
      const saved = userID
        ? localStorage.getItem(`cached_farmer_wallet_${userID}`)
        : null;
      return saved ? JSON.parse(saved).wallet : null;
    } catch (e) {
      return null;
    }
  });
  const [walletData, setWalletData] = useState(() => {
    try {
      const saved = userID
        ? localStorage.getItem(`cached_farmer_wallet_${userID}`)
        : null;
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Optimize Loading: Default to false to show zeros/cached data immediately
  const [loading, setLoading] = useState(false);
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
  const preFetchDashboardData = React.useCallback(
    async (isSilent = false) => {
      if (!userID || userID === "admin-id") {
        setLoading(false);
        return;
      }

      // Failsafe: Restore from cache if state is empty (prevents flash)
      if (orders.received.length === 0) {
        const cached = localStorage.getItem(`cached_farmer_orders_${userID}`);
        if (cached) setOrders(JSON.parse(cached));
      }
      if (!preFetchedProducts || preFetchedProducts.length === 0) {
        const cached = localStorage.getItem(`cached_farmer_products_${userID}`);
        if (cached) setPreFetchedProducts(JSON.parse(cached));
      }
      if (!wallet) {
        const cached = localStorage.getItem(`cached_farmer_wallet_${userID}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setWallet(parsed.wallet);
          setWalletData(parsed);
        }
      }

      // Check for cached data to prevent loading flash
      const hasCachedData =
        (orders.received && orders.received.length > 0) ||
        (preFetchedProducts && preFetchedProducts.length > 0) ||
        wallet;

      // Only set loading if no cached data exists (for first-time visit)
      // Note: User prefers immediate empty state over spinner, so loading is skipped even then
      // if (!isSilent && !hasCachedData) setLoading(true);

      try {
        // Parallel fetch for high performance (resilient to individual failures)
        const ts = Date.now();
        const results = await Promise.allSettled([
          api.get(`/users/profile/${userID}?v=${ts}`),
          api.get("/products", { params: { userID, v: ts } }),
          api.get(`/wallet/${userID}?v=${ts}`),
          api.get("/orders", { params: { userID, role: "seller", v: ts } }),
        ]);

        const [profileRes, productsRes, walletRes, ordersRes] = results;

        // 1. Handle Profile
        if (profileRes.status === "fulfilled") {
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
        if (productsRes.status === "fulfilled") {
          setPreFetchedProducts(productsRes.value.data);
          localStorage.setItem(
            `cached_farmer_products_${userID}`,
            JSON.stringify(productsRes.value.data),
          );
        } else {
          console.error("Products fetch failed:", productsRes.reason);
        }

        // 3. Handle Wallet
        if (walletRes.status === "fulfilled") {
          setWallet(walletRes.value.data.wallet);
          setWalletData(walletRes.value.data);
          localStorage.setItem(
            `cached_farmer_wallet_${userID}`,
            JSON.stringify(walletRes.value.data),
          );
        } else {
          console.error("Wallet fetch failed:", walletRes.reason);
        }

        // 4. Handle Orders
        if (ordersRes.status === "fulfilled") {
          const updatedOrders = { received: ordersRes.value.data };
          setOrders(updatedOrders);
          localStorage.setItem(
            `cached_farmer_orders_${userID}`,
            JSON.stringify(updatedOrders),
          );
        } else {
          console.error("Orders fetch failed:", ordersRes.reason);
        }

        console.log(
          `>>> Farmer Dashboard sync complete (${isSilent ? "Silent" : "Full"})`,
        );
      } catch (err) {
        console.error("Dashboard massive sync failed:", err);
      } finally {
        if (!isSilent) setLoading(false); // Done fetching (allSettled ensures we get here)
      }
    },
    [userID, user],
  );

  useEffect(() => {
    preFetchDashboardData(true); // Always silent to avoid persistent skeletons for new users

    // Socket listeners for real-time updates
    if (socket) {
      const handleUpdate = (data) => {
        console.log(">>> [Socket] Received refresh event:", data);
        preFetchDashboardData(true); // Silent refresh

        // If user is currently viewing the updated order, sync it
        const incomingOrder = data?.order || (data?._id ? data : null);
        if (incomingOrder && selectedOrder?._id === incomingOrder._id) {
          console.log(">>> Syncing viewed order detail");
          setSelectedOrder(incomingOrder);
        }
      };

      socket.on("order:new", handleUpdate);
      socket.on("dashboard:update", handleUpdate);

      return () => {
        socket.off("order:new", handleUpdate);
        socket.off("dashboard:update", handleUpdate);
      };
    }
  }, [userID, socket, selectedOrder]);

  useEffect(() => {
    sessionStorage.setItem("farmerActiveView", activeView);

    if (selectedOrder) {
      sessionStorage.setItem("selectedOrder", JSON.stringify(selectedOrder));
    } else {
      sessionStorage.removeItem("selectedOrder");
    }
  }, [activeView, selectedOrder]);

  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userUpdated"));
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
    // Proactively refresh dashboard data when an order is updated locally
    preFetchDashboardData(true);
  };

  // ==========================================
  // DASHBOARD CALCULATIONS
  // ==========================================

  // 1. Total Earnings
  // Logic: Order must be DELIVERED and Payment must be PAID.
  // We prioritize the Order collection as the "master" record for Delivery + Payment status to ensure we capture everything even if a transaction record is missing.

  const earningsFromOrders = (orders.received || []).reduce((sum, order) => {
    // Condition 1: Order must be Delivered
    const isDelivered = order.status === "Delivered";
    // Condition 2: Payment must be Completed/Paid
    const isPaid =
      order.paymentStatus === "Paid" || order.paymentStatus === "Completed";

    // Include if strictly Delivered AND Paid
    if (isDelivered && isPaid) {
      return sum + Number(order.totalAmount || 0);
    }
    return sum;
  }, 0);

  const totalEarnings = earningsFromOrders;

  // 2. Pending Payments
  // Logic:
  // - Online: Transaction status is "Locked"
  // - COD: Check both Order (status) and Transaction (payment status) -> Order not Delivered OR Payment not Paid

  const pendingOnlineLocked = (walletData?.onlineTransactions || [])
    .filter((t) => t.status === "Locked")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const pendingCOD = (orders.received || [])
    .filter((o) => {
      // Only check COD orders
      if (o.paymentMethod !== "COD") return false;

      // Exclude if Canceled
      if (o.status === "Canceled" || o.status === "Rejected") return false;

      // Pending condition:
      // User Req: "Sums up COD orders that are NOT Delivered and NOT Paid."
      const isPending = o.status !== "Delivered" && o.paymentStatus !== "Paid";

      return isPending;
    })
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const totalPendingPayments = pendingOnlineLocked + pendingCOD;

  // 3. Orders Received: Lifetime orders (including canceled/rejected)
  const ordersReceivedCount = (orders.received || []).length;

  // 4. Products Listed: Active products
  const productsListedCount = (preFetchedProducts || []).filter(
    (p) => p.availableStatus === "Available",
  ).length;

  // Process Chart Data (restored)
  const salesData = React.useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = months.map((name) => ({ name, fruits: 0, vegetables: 0 }));

    (orders.received || []).forEach((order) => {
      if (order.status !== "Delivered") return;
      const date = new Date(order.createdAt);
      const monthIndex = date.getMonth();
      order.products.forEach((item) => {
        const cat = item.category ? item.category.toLowerCase() : "vegetables";
        if (cat.includes("fruit")) data[monthIndex].fruits += item.quantity;
        else data[monthIndex].vegetables += item.quantity;
      });
    });
    return data;
  }, [orders.received]);

  // Order Status Distribution (for Pie Chart)
  const orderStatusData = React.useMemo(() => {
    let pending = 0;
    let active = 0;
    let delivered = 0;
    let canceled = 0;

    (orders.received || []).forEach((order) => {
      const s = order.status;
      if (s === "Delivered") delivered++;
      else if (s === "Canceled" || s === "Rejected") canceled++;
      else if (s === "Accepted" || s === "Processing" || s === "Shipping")
        active++;
      else pending++;
    });

    if (pending === 0 && active === 0 && delivered === 0 && canceled === 0)
      return [];

    return [
      { name: "Pending", value: pending, color: "#f39c12" },
      { name: "Active", value: active, color: "#3498db" },
      { name: "Delivered", value: delivered, color: "#2ecc71" },
      { name: "Canceled", value: canceled, color: "#e74c3c" },
    ];
  }, [orders.received]);

  // Recent Transactions (Merged Online + COD + Withdrawals)
  const recentTransactions = React.useMemo(() => {
    if (!walletData) return [];

    const online = (walletData.onlineTransactions || []).map((t) => ({
      ...t,
      method: t.paymentMethod || "Online",
      remarks: t.description || "Vendor Payment",
      date: t.createdAt,
    }));

    const cod = (walletData.codTransactions || []).map((t) => ({
      ...t,
      method: "COD",
      remarks: t.description || "Product Sale",
      date: t.date || t.createdAt,
    }));

    const withdrawals = (walletData.withdrawals || []).map((t) => ({
      ...t,
      method: t.paymentMethod || "Transfer",
      remarks: `Withdrawal to ${t.accountNumber || "account"}`,
      date: t.createdAt,
      amount: -Math.abs(t.amount),
    }));

    const all = [...online, ...cod, ...withdrawals];
    return all.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [walletData]);

  const recentOrders = (orders.received || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Low Stock Inventory (Snapshot)
  const lowStockThreshold = 20;
  const lowStockProducts = (preFetchedProducts || [])
    .filter((p) => p.quantity < lowStockThreshold)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
              position: "relative",
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
              <div className="fd-hero-text">
                <h1>Welcome to Agromart, {user.name}!</h1>
                <p>Here's what's happening on your farm today.</p>
              </div>
            </section>

            {/* 1. Metric Cards */}
            <section className="fd-stats-grid">
              <>
                {/* Total Earnings */}
                <div className="fd-stat-card fd-card-green">
                  <div className="fd-stat-header">
                    <span className="fd-stat-title">Total Earnings</span>
                    <div className="fd-icon-bg">
                      <TbCurrencyRupeeNepalese />
                    </div>
                  </div>
                  <div className="fd-stat-value">
                    Rs. {totalEarnings.toLocaleString()}
                  </div>
                  <div className="fd-stat-footer">
                    Verified & Released Sales
                  </div>
                </div>

                {/* Pending Payments */}
                <div className="fd-stat-card fd-card-orange">
                  <div className="fd-stat-header">
                    <span className="fd-stat-title">Pending Payments</span>
                    <div className="fd-icon-bg">
                      <FaWallet />
                    </div>
                  </div>
                  <div className="fd-stat-value">
                    Rs. {totalPendingPayments.toLocaleString()}
                  </div>
                  <div className="fd-stat-footer">Holds & Undelivered COD</div>
                </div>

                {/* Orders Received */}
                <div className="fd-stat-card fd-card-blue">
                  <div className="fd-stat-header">
                    <span className="fd-stat-title">Orders Received</span>
                    <div className="fd-icon-bg">
                      <FaShoppingCart />
                    </div>
                  </div>
                  <div className="fd-stat-value">{ordersReceivedCount}</div>
                  <div className="fd-stat-footer">Lifetime Orders</div>
                </div>

                {/* Products Listed */}
                <div className="fd-stat-card fd-card-purple">
                  <div className="fd-stat-header">
                    <span className="fd-stat-title">Products Listed</span>
                    <div className="fd-icon-bg">
                      <FaBoxOpen />
                    </div>
                  </div>
                  <div className="fd-stat-value">{productsListedCount}</div>
                  <div className="fd-stat-footer">Active Listings</div>
                </div>
              </>
            </section>

            <div className="fd-quick-actions-container">
              <div className="fd-quick-actions">
                <button
                  onClick={() => setActiveView("addProduct")}
                  className="qa-btn"
                >
                  <FaBoxOpen /> Add Product
                </button>
                <button
                  onClick={() => setActiveView("orders")}
                  className="qa-btn"
                >
                  <FaShoppingCart /> View Orders
                </button>
                <button
                  onClick={() => setActiveView("analytics")}
                  className="qa-btn"
                >
                  <FaChartBar /> Analytics
                </button>
              </div>
            </div>

            {/* Dashboard Content Rows */}
            <div className="fd-content-rows">
              {/* Row 1: Recent Orders + Inventory Snapshot */}
              <div className="fd-layout-row">
                <section className="fd-section-block fd-recent-orders">
                  <div className="fd-section-header">
                    <h3>Recent Orders</h3>
                    <button
                      className="fd-action-btn"
                      onClick={() => setActiveView("orders")}
                    >
                      View All
                    </button>
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="fd-empty-state">
                      <FaShoppingCart
                        size={40}
                        style={{ color: "#cbd5e0", marginBottom: "1rem" }}
                      />
                      <p>You haven't received any orders yet.</p>
                      <span>New orders from customers will appear here.</span>
                    </div>
                  ) : (
                    <>
                      <div className="fd-table-container">
                        <table className="fd-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Status</th>
                              <th>Payment</th>
                              <th>Total</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map((order) => (
                              <tr key={order._id}>
                                <td>{order.orderID}</td>
                                <td>
                                  <span
                                    className={`status-badge ${order.status.toLowerCase()}`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td>{order.paymentMethod}</td>
                                <td className="font-medium">
                                  Rs. {order.totalAmount}
                                </td>
                                <td>
                                  <button
                                    className="fd-action-btn"
                                    onClick={() => handleViewOrder(order)}
                                  >
                                    Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View for Orders */}
                      <div className="fd-mobile-cards">
                        {recentOrders.map((order) => (
                          <div key={order._id} className="fd-mobile-order-card">
                            <div className="card-row">
                              <span className="card-label">Order ID:</span>
                              <span className="card-val">{order.orderID}</span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Status:</span>
                              <span
                                className={`status-badge ${order.status.toLowerCase()}`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Total:</span>
                              <span className="card-val">
                                Rs. {order.totalAmount}
                              </span>
                            </div>
                            <button
                              className="fd-action-btn"
                              style={{ width: "100%", marginTop: "1rem" }}
                              onClick={() => handleViewOrder(order)}
                            >
                              View Details
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>

                {/* Inventory Snapshot Widget */}
                <div className="fd-widget-card fd-inventory-widget">
                  <div className="fd-widget-header">
                    <h3>Inventory Snapshot</h3>
                  </div>
                  {
                    <div className="fd-inventory-list-wrapper">
                      <div className="fd-inventory-list scrollable-no-bar">
                        {lowStockProducts.length > 0 ? (
                          lowStockProducts.map((p) => {
                            const isOutOfStock = p.quantity === 0;
                            return (
                              <div
                                key={p._id}
                                className={`fd-inv-item ${isOutOfStock ? "out-of-stock" : "low-stock"}`}
                              >
                                <div className="inv-info">
                                  <span className="inv-name">
                                    {p.productName}
                                  </span>
                                  <span
                                    className={`inv-status ${isOutOfStock ? "critical" : "warning"}`}
                                  >
                                    {isOutOfStock ? "Out of Stock" : "Low Stock"}
                                  </span>
                                </div>
                                <div className="inv-qty">
                                  {p.quantity} {p.unit}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="fd-good-state">
                            <FaCheckCircle
                              style={{
                                color: "#1dc956",
                                fontSize: "2rem",
                                marginBottom: "0.5rem",
                              }}
                            />
                            <p style={{ fontWeight: "600", color: "#16a34a" }}>
                              Inventory is Healthy
                            </p>
                            <span
                              style={{ fontSize: "0.85rem", color: "#718096" }}
                            >
                              All your products have sufficient stock levels.
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        className="fd-action-btn inv-manage-btn"
                        onClick={() => setActiveView("products")}
                      >
                        Manage Inventory
                      </button>
                    </div>
                  }
                </div>
              </div>

              {/* Row 2: Recent Transactions + Sales Trend */}
              <div className="fd-layout-row">
                <section className="fd-section-block fd-recent-transactions">
                  <div className="fd-section-header">
                    <h3>Recent Transactions</h3>
                    <button
                      className="fd-action-btn"
                      onClick={() => setActiveView("payments")}
                    >
                      View All
                    </button>
                  </div>

                  {recentTransactions.length === 0 ? (
                    <div className="fd-empty-state">
                      <FaHistory
                        size={40}
                        style={{ color: "#cbd5e0", marginBottom: "1rem" }}
                      />
                      <p>No transactions found.</p>
                      <span>
                        Completed payments and withdrawals will be listed here.
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="fd-table-container">
                        <table className="fd-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Method</th>
                              <th>Status</th>
                              <th>Amount</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentTransactions.map((t, idx) => (
                              <tr key={t._id || idx}>
                                <td>{new Date(t.date).toLocaleDateString()}</td>
                                <td className="font-medium">{t.method}</td>
                                <td>
                                  <span
                                    className={`status-badge ${t.status?.toLowerCase() || "completed"}`}
                                  >
                                    {t.status || "Completed"}
                                  </span>
                                </td>
                                <td
                                  className={`font-medium ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}
                                >
                                  {t.amount < 0 ? "-" : ""}Rs.{" "}
                                  {Math.abs(t.amount).toLocaleString()}
                                </td>
                                <td className="txn-remarks">{t.remarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View for Transactions */}
                      <div className="fd-mobile-cards">
                        {recentTransactions.map((t, idx) => (
                          <div
                            key={t._id || idx}
                            className="fd-mobile-order-card"
                          >
                            <div className="card-row">
                              <span className="card-label">Date:</span>
                              <span className="card-val">
                                {new Date(t.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Method:</span>
                              <span className="card-val">{t.method}</span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Status:</span>
                              <span
                                className={`status-badge ${t.status?.toLowerCase() || "completed"}`}
                              >
                                {t.status || "Completed"}
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Amount:</span>
                              <span
                                className={`card-val font-medium ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}
                              >
                                {t.amount < 0 ? "-" : ""}Rs.{" "}
                                {Math.abs(t.amount).toLocaleString()}
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Remarks:</span>
                              <span className="card-val">{t.remarks}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>

                <div className="fd-widget-card chart-widget fd-trend-widget">
                  <div className="fd-widget-header">
                    <h3>Sales Trend</h3>
                  </div>
                  <div
                    style={{ width: "100%", height: "100%", minHeight: 320 }}
                  >
                    {salesData.some((d) => d.vegetables > 0 || d.fruits > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={salesData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: "#888" }}
                            axisLine={false}
                            tickLine={false}
                            interval={2}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#888" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Legend
                            verticalAlign="top"
                            align="right"
                            height={36}
                            wrapperStyle={{
                              fontSize: "12px",
                              paddingBottom: "10px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="vegetables"
                            name="Vegetables"
                            stroke="#1dc956"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="fruits"
                            name="Fruits"
                            stroke="#f1c40f"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="fd-empty-chart-mini">
                        <FaChartLine
                          size={32}
                          color="#cbd5e0"
                          style={{ marginBottom: "0.5rem" }}
                        />
                        <p>No sales trend yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Order Status Pie Chart (Full Width) */}
              <div className="fd-layout-row-full">
                <div className="fd-widget-card chart-widget full-width-centered-pie">
                  <div className="fd-widget-header">
                    <h3>Overall Order Status</h3>
                  </div>
                  <div style={{ width: "100%", height: 350 }}>
                    {orderStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={40}
                            iconType="circle"
                            iconSize={10}
                            wrapperStyle={{
                              fontSize: "14px",
                              paddingTop: "20px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="fd-empty-chart-mini">
                        <FaChartPie
                          size={32}
                          color="#cbd5e0"
                          style={{ marginBottom: "0.5rem" }}
                        />
                        <p>No order data</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}{" "}
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
          <OrderManagement
            onViewOrder={handleViewOrder}
            ordersProp={orders.received}
          />
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
