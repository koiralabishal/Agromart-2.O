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
  FaBars,
  FaTimes,
  FaList,
  FaTruck,
  FaUser,
  FaEnvelope,
  FaCreditCard,
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaHistory,
  FaCheckCircle,
  FaBoxOpen,
  FaWallet,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosConfig";
import DistributorsView from "./DistributorsView";
import DistributorProductView from "./DistributorProductView";
import BuyerOrderManagement from "./BuyerOrderManagement";
import BuyerOrderDetailView from "./BuyerOrderDetailView";
import SettingsView from "./SettingsView";
import BuyerNotificationsView from "./BuyerNotificationsView";
import CartView from "./CartView";
import PaymentsView from "./PaymentsView";
import DetailedAnalytics from "./DetailedAnalytics";
import { useSocket } from "../../../context/SocketContext";
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
  PieChart,
  Pie,
  Cell,
  Label,
} from "recharts";
import "./Styles/BuyerDashboard.css";

const BuyerDashboard = () => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : { name: "John Doe" };
    } catch (e) {
      return { name: "John Doe" };
    }
  });
  const userID = user?._id || user?.id;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(
    sessionStorage.getItem("buyerActiveView") || "dashboard",
  );
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
  const [preFetchedDistributors, setPreFetchedDistributors] = useState(() => {
    try {
      const saved = localStorage.getItem("cached_active_distributors");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [orders, setOrders] = useState(() => {
    try {
      const saved = userID
        ? localStorage.getItem(`cached_buyer_orders_${userID}`)
        : null;
      return saved ? JSON.parse(saved) : { placed: [] };
    } catch (e) {
      return { placed: [] };
    }
  });
  const [wallet, setWallet] = useState(() => {
    try {
      const saved = userID
        ? localStorage.getItem(`cached_buyer_wallet_${userID}`)
        : null;
      return saved ? JSON.parse(saved).wallet : {};
    } catch (e) {
      return {};
    }
  });
  const [walletData, setWalletData] = useState(() => {
    try {
      const saved = userID
        ? localStorage.getItem(`cached_buyer_wallet_${userID}`)
        : null;
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const socket = useSocket();

  const navigate = useNavigate();

  // Sync user state from localStorage and background fetch
  useEffect(() => {
    const handleSync = () => {
      setUser(JSON.parse(localStorage.getItem("user")) || { name: "John Doe" });
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("userUpdated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("userUpdated", handleSync);
    };
  }, []);

  // Background data fetching for high performance (Zero-Loading feel)
  const preFetchDashboardData = React.useCallback(
    async (isSilent = false) => {
      if (!userID || userID === "admin-id") {
        setLoading(false);
        return;
      }

      // Failsafe: Restore from cache if state is empty (prevents flash)
      if (orders.placed.length === 0) {
        const cached = localStorage.getItem(`cached_buyer_orders_${userID}`);
        if (cached) setOrders(JSON.parse(cached));
      }
      if (!preFetchedDistributors || preFetchedDistributors.length === 0) {
        const cached = localStorage.getItem("cached_active_distributors");
        if (cached) setPreFetchedDistributors(JSON.parse(cached));
      }
      if (!wallet) {
        const cached = localStorage.getItem(`cached_buyer_wallet_${userID}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setWallet(parsed.wallet);
          setWalletData(parsed);
        }
      }

      // Check for cached data to prevent loading flash
      const hasCachedData =
        (orders.placed && orders.placed.length > 0) ||
        (preFetchedDistributors && preFetchedDistributors.length > 0) ||
        wallet;

      // Only set loading if no cached data exists
      // Note: Disabled to show instant empty state instead of spinner for new users too
      // if (!isSilent && !hasCachedData) setLoading(true);

      try {
        // Parallel fetch for speed - added cache busting
        const ts = Date.now();
        const results = await Promise.allSettled([
          api.get(`/users/active-distributors?v=${ts}`),
          api.get(`/users/profile/${userID}?v=${ts}`),
          api.get(`/wallet/${userID}?v=${ts}`),
          api.get("/orders", { params: { userID, role: "buyer", v: ts } }),
        ]);

        const [distRes, profileRes, walletRes, ordersRes] = results;

        // 1. Handle Distributors Data
        if (distRes.status === "fulfilled") {
          setPreFetchedDistributors(distRes.value.data);
          localStorage.setItem(
            "cached_active_distributors",
            JSON.stringify(distRes.value.data),
          );
        }

        // 2. Handle Profile Sync
        if (profileRes.status === "fulfilled") {
          const updatedUser = { ...user, ...profileRes.value.data };
          if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        }

        // 3. Handle Wallet Data
        if (walletRes.status === "fulfilled") {
          setWallet(walletRes.value.data.wallet);
          setWalletData(walletRes.value.data);
          localStorage.setItem(
            `cached_buyer_wallet_${userID}`,
            JSON.stringify(walletRes.value.data),
          );
        }

        // 4. Handle Orders
        if (ordersRes.status === "fulfilled") {
          const updatedOrders = { placed: ordersRes.value.data };
          setOrders(updatedOrders);
          localStorage.setItem(
            `cached_buyer_orders_${userID}`,
            JSON.stringify(updatedOrders),
          );
        }

        console.log(
          `>>> Buyer Dashboard sync complete (${isSilent ? "Silent" : "Full"})`,
        );
      } catch (err) {
        console.error("Error pre-fetching buyer data:", err);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [userID, user],
  );

  useEffect(() => {
    preFetchDashboardData(!!preFetchedDistributors && !!walletData);

    if (socket) {
      const handleUpdate = (data) => {
        console.log(">>> [Socket] Received refresh event:", data);
        preFetchDashboardData(true); // Silent sync

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
  }, [userID, socket]);

  useEffect(() => {
    sessionStorage.setItem("buyerActiveView", activeView);
    sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
    sessionStorage.setItem("hasViewedCart", hasViewedCart);
    if (selectedDistributor) {
      sessionStorage.setItem(
        "selectedDistributor",
        JSON.stringify(selectedDistributor),
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
          (item) => (item._id || item.id) === productId,
        );
        if (existingItem) {
          return prevItems.map((item) =>
            (item._id || item.id) === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        } else {
          return [...prevItems, { ...product, quantity: 1 }];
        }
      });
      setHasViewedCart(false);
      console.log(
        `>>> Inventory updated: ${product.productName} quantity decreased by 1`,
      );
    } catch (err) {
      console.error("Failed to update inventory quantity on add:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update stock. Please try again.",
      );
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
          item.id === id || item._id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item,
        ),
      );
      console.log(
        `>>> Inventory updated: ID ${id} quantity changed by ${-delta}`,
      );
    } catch (err) {
      console.error("Failed to update inventory quantity on change:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update stock. Please try again.",
      );
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      // 1. Find the item in cart to get its quantity
      const itemToRemove = cartItems.find(
        (item) => item.id === id || item._id === id,
      );
      if (!itemToRemove) return;

      // 2. Return total quantity back to inventory
      await api.patch(`/inventory/${id}/quantity`, {
        delta: itemToRemove.quantity,
      });

      // 3. Update local cart state
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== id && item._id !== id),
      );
      console.log(
        `>>> Inventory updated: ID ${id} restored ${itemToRemove.quantity} units`,
      );
    } catch (err) {
      console.error("Failed to update inventory quantity on remove:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update stock. Please try again.",
      );
    }
  };

  const cartCount = cartItems.length;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userUpdated")); // Signal socket disconnect
      sessionStorage.removeItem("buyerActiveView");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.removeItem("user");
      sessionStorage.removeItem("buyerActiveView");
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

  const handleViewProfile = (distributor) => {
    setSelectedDistributor(distributor);
    setActiveView("distributorProduct");
  };

  const totalOrdersAmount = (orders?.placed || [])
    .filter((o) => o.status === "Delivered" && o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrdersCount = (orders?.placed || []).filter((o) =>
    ["Processing", "Shipping"].includes(o.status),
  ).length;

  const pendingOrdersCount = (orders?.placed || []).filter(
    (o) => o.status === "Pending",
  ).length;

  // Process chart data from orders
  const getProcessedMonthlyBuys = () => {
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
    const data = months.map((m) => ({ name: m, vegetables: 0, fruits: 0 }));

    (orders?.placed || []).forEach((order) => {
      if (order.status !== "Delivered" || order.paymentStatus !== "Paid")
        return;
      const m = new Date(order.createdAt).getMonth();
      order.products.forEach((p) => {
        if ((p.category || "").toLowerCase().includes("fruit"))
          data[m].fruits += p.quantity;
        else data[m].vegetables += p.quantity;
      });
    });
    return data;
  };

  const getHighOrderProducts = () => {
    const map = {};
    (orders?.placed || []).forEach((order) => {
      order.products.forEach((p) => {
        map[p.productName] = (map[p.productName] || 0) + p.quantity;
      });
    });
    return Object.entries(map)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 7);
  };

  const processedMonthlyBuys = getProcessedMonthlyBuys();
  const processedHighOrderProducts = getHighOrderProducts();

  const orderStatusData = React.useMemo(() => {
    let pending = 0;
    let active = 0;
    let delivered = 0;
    let canceled = 0;

    (orders?.placed || []).forEach((order) => {
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
  }, [orders.placed]);

  // New Memoized Data for refined layout
  const recentOrders = React.useMemo(() => {
    return (orders?.placed || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [orders.placed]);

  const recentTransactions = React.useMemo(() => {
    if (!walletData) return [];
    const online = (walletData.onlineTransactions || []).map((t) => ({
      ...t,
      method: t.paymentMethod || "Online",
      source: t.description || "Online Payment",
      date: t.createdAt,
    }));
    const cod = (walletData.codTransactions || []).map((t) => ({
      ...t,
      method: "COD",
      source: t.description || "COD Payment",
      date: t.date || t.createdAt,
    }));
    const all = [...online, ...cod];
    return all.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [walletData]);

  const topDistributors = React.useMemo(() => {
    // 1. Calculate order count per seller from placed orders
    const sellerOrderCounts = (orders?.placed || []).reduce((acc, order) => {
      const id = order.sellerID?._id || order.sellerID;
      if (id) {
        acc[id] = (acc[id] || 0) + 1;
      }
      return acc;
    }, {});

    // 2. Sort seller IDs by order count (descending)
    const sortedSellerIds = Object.keys(sellerOrderCounts).sort(
      (a, b) => sellerOrderCounts[b] - sellerOrderCounts[a],
    );

    // 3. Map to actual distributor objects
    const orderedDistributors = sortedSellerIds
      .map((id) => (preFetchedDistributors || []).find((d) => d._id === id))
      .filter(Boolean);

    // 4. Fill remaining spots with other distributors (who haven't received orders yet)
    const otherDistributors = (preFetchedDistributors || []).filter(
      (d) => !sellerOrderCounts[d._id],
    );

    const merged = [...orderedDistributors, ...otherDistributors];

    // 5. Return top 10
    return merged.slice(0, 10);
  }, [orders.placed, preFetchedDistributors]);

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
          <div
            className={`bd-nav-item ${
              activeView === "payments" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("payments");
              setSelectedDistributor(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaCreditCard /> Payments
          </div>
          <div
            className={`bd-nav-item ${
              activeView === "analytics" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("analytics");
              setSelectedDistributor(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaChartBar /> Analytics
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


          <div className="bd-profile-container">
            <img
              src={
                user.profileImage ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn"
              }
              alt="Profile"
              className="bd-profile-pic"
            />
            <div className="bd-profile-tooltip">
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
                Manage your orders and explore the best agricultural products.
              </p>
            </section>

            {/* Stats Grid */}
            <section className="bd-stats-grid">
              <div className="bd-stat-card bd-card-green">
                <div className="bd-stat-header">
                  <span className="bd-stat-title">Total Orders</span>
                  <div className="bd-icon-bg">
                    <FaList />
                  </div>
                </div>
                <div className="bd-stat-value">
                  {(orders?.placed || []).length || 0}
                </div>
                <div className="bd-stat-footer">Life-time history</div>
              </div>

              <div className="bd-stat-card bd-card-yellow">
                <div className="bd-stat-header">
                  <span className="bd-stat-title">Active Orders</span>
                  <div className="bd-icon-bg">
                    <FaShoppingCart />
                  </div>
                </div>
                <div className="bd-stat-value">{activeOrdersCount || 0}</div>
                <div className="bd-stat-footer">In processing</div>
              </div>

              <div className="bd-stat-card bd-card-orange">
                <div className="bd-stat-header">
                  <span className="bd-stat-title">Pending Orders</span>
                  <div className="bd-icon-bg">
                    <FaTruck />
                  </div>
                </div>
                <div className="bd-stat-value">{pendingOrdersCount || 0}</div>
                <div className="bd-stat-footer">Awaiting approval</div>
              </div>

              <div className="bd-stat-card bd-card-purple">
                <div className="bd-stat-header">
                  <span className="bd-stat-title">Total Spending</span>
                  <div className="bd-icon-bg">
                    <TbCurrencyRupeeNepalese />
                  </div>
                </div>
                <div className="bd-stat-value">
                  Rs. {(totalOrdersAmount || 0).toLocaleString()}
                </div>
                <div className="bd-stat-footer">Approved payments</div>
              </div>
            </section>

            <div className="bd-quick-actions-container">
              <div className="bd-quick-actions">
                <button
                  onClick={() => setActiveView("distributors")}
                  className="qa-btn"
                >
                  <FaUsers /> Browse Distributors
                </button>
                <button
                  onClick={() => setActiveView("orders")}
                  className="qa-btn"
                >
                  <FaShoppingCart /> View My Orders
                </button>
                <button
                  onClick={() => setActiveView("analytics")}
                  className="qa-btn"
                >
                  <FaChartBar /> Analytics
                </button>
              </div>
            </div>

            <div className="bd-content-rows">
              {/* Row 1: Recent Orders + Distributors Fragment */}
              <div className="bd-layout-row">
                <section className="bd-section-block">
                  <div className="bd-section-header">
                    <h3>Recent Orders</h3>
                    <button
                      className="bd-action-btn-small"
                      onClick={() => setActiveView("orders")}
                    >
                      View All
                    </button>
                  </div>
                  {recentOrders.length === 0 ? (
                    <div className="bd-empty-state">
                      <FaBoxOpen
                        size={40}
                        style={{ color: "#cbd5e0", marginBottom: "1rem" }}
                      />
                      <p>Your shop is empty</p>
                      <span>
                        Once you start buying, your recent orders will appear
                        here.
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="bd-table-container">
                        <table className="bd-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Total</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map((order) => (
                              <tr key={order._id}>
                                <td>{order.orderID || order._id.slice(-8)}</td>
                                <td>
                                  <span className="role-badge buyer">
                                    Buyer
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`status-badge ${order.status.toLowerCase()}`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td className="font-medium">
                                  Rs. {order.totalAmount}
                                </td>
                                <td>
                                  <button
                                    className="bd-action-btn-small"
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
                      <div className="bd-mobile-cards">
                        {recentOrders.map((order) => (
                          <div key={order._id} className="bd-mobile-order-card">
                            <div className="card-row">
                              <span className="card-label">Order ID:</span>
                              <span className="card-val">
                                {order.orderID || order._id.slice(-8)}
                              </span>
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
                              <span className="card-label">Items:</span>
                              <span className="card-val">
                                {order.products.length} items
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Total:</span>
                              <span className="card-val">
                                Rs. {order.totalAmount}
                              </span>
                            </div>
                            <button
                              className="bd-action-btn-small"
                              style={{ width: "100%", marginTop: "0.5rem" }}
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

                <div className="bd-widget-card">
                  <div className="bd-widget-header">
                    <h3>Top Distributors</h3>
                    <button
                      className="bd-action-btn-small"
                      onClick={() => setActiveView("distributors")}
                    >
                      Find More
                    </button>
                  </div>
                  <div className="bd-dist-list">
                    {topDistributors.length > 0 ? (
                      topDistributors.map((dist) => (
                        <div key={dist._id} className="bd-dist-item">
                          <div className="dist-info">
                            <img
                              src={
                                dist.profileImage ||
                                "https://api.dicebear.com/7.x/initials/svg?seed=" +
                                  dist.name
                              }
                              alt=""
                              className="dist-img"
                            />
                            <div>
                              <div className="dist-name">{dist.name}</div>
                              <div className="dist-loc">
                                {dist.address || "Nepal"}
                              </div>
                            </div>
                          </div>
                          <button
                            className="bd-action-btn-small"
                            onClick={() => handleViewProfile(dist)}
                          >
                            View
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="bd-empty-state">
                        <FaUsers
                          size={40}
                          style={{ color: "#cbd5e0", marginBottom: "1rem" }}
                        />
                        <p>Finding vendors...</p>
                        <span>
                          Distributors will appear here as they join the
                          platform.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Recent Transactions + Spending Summary */}
              <div className="bd-layout-row">
                <section className="bd-section-block">
                  <div className="bd-section-header">
                    <h3>Recent Transactions</h3>
                    <button
                      className="bd-action-btn-small"
                      onClick={() => setActiveView("payments")}
                    >
                      View All
                    </button>
                  </div>
                  {recentTransactions.length === 0 ? (
                    <div className="bd-empty-state">
                      <FaWallet
                        size={40}
                        style={{ color: "#cbd5e0", marginBottom: "1rem" }}
                      />
                      <p>No history yet</p>
                      <span>
                        Your payments and wallet activities will be listed here.
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="bd-table-container">
                        <table className="bd-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Status</th>
                              <th>Method</th>
                              <th>Amount</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentTransactions.map((t, idx) => (
                              <tr key={idx}>
                                <td>{new Date(t.date).toLocaleDateString()}</td>
                                <td>
                                  <span
                                    className={`status-badge ${t.status?.toLowerCase() || "completed"}`}
                                  >
                                    {t.status || "Completed"}
                                  </span>
                                </td>
                                <td className="font-medium">{t.method}</td>
                                <td className="font-medium debit-amount">
                                  Rs. {t.amount}
                                </td>
                                <td className="txn-desc">{t.source}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View for Transactions */}
                      <div className="bd-mobile-cards">
                        {recentTransactions.map((t, idx) => (
                          <div key={idx} className="bd-mobile-order-card">
                            <div className="card-row">
                              <span className="card-label">Date:</span>
                              <span className="card-val">
                                {new Date(t.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Method:</span>
                              <span className="card-val font-medium">
                                {t.method}
                              </span>
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
                              <span className="card-val debit-amount">
                                Rs. {t.amount}
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Remarks:</span>
                              <span className="card-val txn-desc">
                                {t.source}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>

                <div className="bd-section-block">
                  <div className="bd-section-header">
                    <h3>Purchase Trend</h3>
                    {/* <button
                          className="bd-action-btn-small"
                          onClick={() => setActiveView("analytics")}
                        >
                          Detailed View
                        </button> */}
                  </div>
                  {processedMonthlyBuys.some(
                    (d) => d.vegetables > 0 || d.fruits > 0,
                  ) ? (
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <LineChart data={processedMonthlyBuys}>
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
                            // dot={false}
                          >
                            <Label
                              value="Months"
                              offset={-5}
                              position="insideBottom"
                              style={{ fontSize: "12px", fill: "#666" }}
                            />
                          </XAxis>
                          <YAxis
                            tick={{ fontSize: 11, fill: "#888" }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          >
                            <Label
                              value="Quantity"
                              angle={-90}
                              position="insideLeft"
                              style={{ fontSize: "12px", fill: "#666" }}
                            />
                          </YAxis>
                          <Tooltip />
                          <Legend verticalAlign="top" align="right" />
                          <Line
                            type="monotone"
                            dataKey="vegetables"
                            stroke="#1DC956"
                            strokeWidth={3}
                            dot={false}
                            name="Vegetables"
                          />
                          <Line
                            type="monotone"
                            dataKey="fruits"
                            stroke="#F5A623"
                            strokeWidth={3}
                            dot={false}
                            name="Fruits"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="bd-empty-state">
                      <FaChartLine
                        size={40}
                        style={{ color: "#cbd5e0", marginBottom: "1rem" }}
                      />
                      <p>No trend data yet</p>
                      <span>
                        Complete orders to see your monthly spending analysis.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Order Distribution Centered */}
              <div className="bd-layout-row-full">
                <div className="bd-section-block full-width-centered-pie">
                  <div className="bd-section-header">
                    <h3>Order Status Distribution</h3>
                  </div>
                  {orderStatusData.length > 0 ? (
                    <div style={{ width: "100%", height: 320 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="bd-empty-state">
                      <FaChartPie
                        size={40}
                        style={{ color: "#cbd5e0", marginBottom: "1rem" }}
                      />
                      <p>Awaiting distribution data</p>
                      <span>
                        A breakdown of your order statuses will appear here.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
          <BuyerOrderManagement
            onViewOrder={handleViewOrder}
            ordersProp={orders.placed}
          />
        )}
        {activeView === "orderDetail" && selectedOrder && (
          <BuyerOrderDetailView
            order={selectedOrder}
            orderType="placed"
            onBack={() => setActiveView("orders")}
            onOrderUpdate={handleOrderUpdate}
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
            onClearCart={() => {
              setCartItems([]);
              sessionStorage.removeItem("cartItems");
              sessionStorage.removeItem("hasViewedCart");
            }}
            onOrderComplete={() => setActiveView("orders")}
          />
        )}
        {activeView === "payments" && (
          <PaymentsView walletDataProp={walletData} />
        )}
        {activeView === "analytics" && (
          <DetailedAnalytics
            orders={orders}
            wallet={wallet}
            walletData={walletData}
          />
        )}
      </main>

      <footer className="bd-footer">
        <div className="bd-footer-text">
          &copy; {new Date().getFullYear()} AgroMart. All rights reserved.
        </div>
        <div className="bd-socials">
          <FaFacebookF /> <FaTwitter /> <FaLinkedinIn />
        </div>
      </footer>
    </div>
  );
};

export default BuyerDashboard;
