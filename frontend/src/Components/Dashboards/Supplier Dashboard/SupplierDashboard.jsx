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
  FaUser,
  FaEnvelope,
  FaWallet,
  FaHistory,
  FaCheckCircle,
  FaChartLine,
  FaChartPie,
  FaShoppingBag,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
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
import PaymentsView from "./PaymentsView";
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
  Cell,
  PieChart,
  Pie,
} from "recharts";
import "./Styles/SupplierDashboard.css";

import api from "../../../api/axiosConfig";
import { useSocket } from "../../../context/SocketContext";

const SupplierDashboard = () => {
  const socket = useSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(
    sessionStorage.getItem("supplierActiveView") || "dashboard",
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
  const [selectedCollector, setSelectedCollector] = useState(() => {
    try {
      const saved = sessionStorage.getItem("selectedCollector");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing selectedCollector", e);
      return null;
    }
  });
  // Initialize from session storage
  const [selectedOrder, setSelectedOrder] = useState(() => {
    try {
      const saved = sessionStorage.getItem("selectedOrder");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [orderType, setOrderType] = useState(
    sessionStorage.getItem("orderType") || "received",
  );
  const [inventorySubView, setInventorySubView] = useState("list");
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : { name: "John Doe" };
    } catch (e) {
      console.error("User parse error:", e);
      return { name: "John Doe" };
    }
  });
  const userID = user?._id || user?.id;

  const [preFetchedCollectors, setPreFetchedCollectors] = useState(() => {
    try {
      const saved = localStorage.getItem("cached_active_collectors");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [ownInventory, setOwnInventory] = useState(() => {
    try {
      const saved = localStorage.getItem("cached_inventory");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = userID
        ? localStorage.getItem(`cached_supplier_orders_${userID}`)
        : null;
      return saved ? JSON.parse(saved) : { placed: [], received: [] };
    } catch (e) {
      return { placed: [], received: [] };
    }
  });
  const [wallet, setWallet] = useState(() => {
    try {
      const saved = userID
        ? localStorage.getItem(`cached_supplier_wallet_${userID}`)
        : null;
      return saved ? JSON.parse(saved).wallet : {};
    } catch (e) {
      return {};
    }
  });
  const [walletData, setWalletData] = useState(() => {
    try {
      const saved = userID
        ? localStorage.getItem(`cached_supplier_wallet_${userID}`)
        : null;
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Optimize Loading: Default to false to show zeros/cached data immediately
  const [loading, setLoading] = useState(false);
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
      if (orders.placed.length === 0 && orders.received.length === 0) {
        const cached = localStorage.getItem(`cached_supplier_orders_${userID}`);
        if (cached) setOrders(JSON.parse(cached));
      }
      if (!preFetchedCollectors || preFetchedCollectors.length === 0) {
        const cached = localStorage.getItem("cached_active_collectors");
        if (cached) setPreFetchedCollectors(JSON.parse(cached));
      }
      if (!ownInventory || ownInventory.length === 0) {
        const cached = localStorage.getItem("cached_inventory");
        if (cached) setOwnInventory(JSON.parse(cached));
      }

      // Check if we have cached data to avoid flashing empty state
      // We no longer set loading=true even if there is no data
      // This ensures we show "zeros" and empty states immediately instead of a spinner
      
      try {
        // Parallel fetch for speed - added cache busting

        const ts = Date.now();
        const results = await Promise.allSettled([
          api.get(`/users/active-collectors?v=${ts}`),
          api.get(`/users/profile/${userID}?v=${ts}`),
          api.get(`/wallet/${userID}?v=${ts}`),
          api.get("/orders", { params: { userID, role: "buyer", v: ts } }), // Collector as buyer
          api.get("/orders", { params: { userID, role: "seller", v: ts } }), // Collector as seller (if applicable)
          api.get(`/inventory?userID=${userID}&v=${ts}`), // Own inventory
        ]);

        const [
          collectorsRes,
          profileRes,
          walletRes,
          ordersBuyerRes,
          ordersSellerRes,
          invRes,
        ] = results;

        // 1. Handle Collectors Data
        if (collectorsRes.status === "fulfilled") {
          setPreFetchedCollectors(collectorsRes.value.data);
          localStorage.setItem(
            "cached_active_collectors",
            JSON.stringify(collectorsRes.value.data),
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
            `cached_supplier_wallet_${userID}`,
            JSON.stringify(walletRes.value.data),
          );
        }

        // 4. Handle Orders
        let buyerOrders =
          ordersBuyerRes.status === "fulfilled"
            ? ordersBuyerRes.value.data
            : [];
        let sellerOrders =
          ordersSellerRes.status === "fulfilled"
            ? ordersSellerRes.value.data
            : [];
        const updatedOrders = { placed: buyerOrders, received: sellerOrders };
        setOrders(updatedOrders);
        localStorage.setItem(
          `cached_supplier_orders_${userID}`,
          JSON.stringify(updatedOrders),
        );

        // 5. Handle Own Inventory
        if (invRes.status === "fulfilled") {
          setOwnInventory(invRes.value.data);
          localStorage.setItem(
            "cached_inventory",
            JSON.stringify(invRes.value.data),
          );
        }

        console.log(
          `>>> Supplier Dashboard sync complete (${isSilent ? "Silent" : "Full"})`,
        );
      } catch (err) {
        console.error("Error pre-fetching collector data:", err);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [userID, user],
  );

  useEffect(() => {
    preFetchDashboardData(true); // Always silent to avoid persistent skeletons for new users

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
    sessionStorage.setItem("supplierActiveView", activeView);
    sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
    sessionStorage.setItem("hasViewedCart", hasViewedCart);

    if (selectedCollector) {
      sessionStorage.setItem(
        "selectedCollector",
        JSON.stringify(selectedCollector),
      );
    } else {
      sessionStorage.removeItem("selectedCollector");
    }

    if (selectedOrder) {
      sessionStorage.setItem("selectedOrder", JSON.stringify(selectedOrder));
    } else {
      sessionStorage.removeItem("selectedOrder");
    }

    if (orderType) {
      sessionStorage.setItem("orderType", orderType);
    }
  }, [activeView, selectedCollector, cartItems, selectedOrder, orderType]);

  const handleAddToCart = async (product) => {
    const productId = product._id || product.id;
    try {
      // 1. Update database quantity (decrease by 1)
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
        `>>> Database updated: ${product.productName} quantity decreased by 1`,
      );
    } catch (err) {
      console.error("Failed to update database quantity on add:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update stock. Please try again.",
      );
    }
  };

  const handleUpdateQuantity = async (id, delta) => {
    try {
      // 1. Update database quantity (delta is what changes for the cart, so inverse for DB)
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
        `>>> Database updated: product ${id} quantity changed by ${-delta}`,
      );
    } catch (err) {
      console.error("Failed to update database quantity on update:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update stock. Please try again.",
      );
    }
  };

  const handleRemoveItem = async (id) => {
    const itemToRemove = cartItems.find((item) => (item._id || item.id) === id);
    if (!itemToRemove) return;

    try {
      // 1. Update database quantity (increase by the total amount that was in cart)
      await api.patch(`/inventory/${id}/quantity`, {
        delta: itemToRemove.quantity,
      });

      // 2. Update local cart state
      setCartItems((prevItems) =>
        prevItems.filter((item) => (item._id || item.id) !== id),
      );
      console.log(
        `>>> Database updated: ${
          itemToRemove.productName || itemToRemove.name
        } quantity restored by ${itemToRemove.quantity}`,
      );
    } catch (err) {
      console.error("Failed to update database quantity on remove:", err);
      // We still remove it from cart locally to avoid blocking user, but log error
      setCartItems((prevItems) =>
        prevItems.filter((item) => (item._id || item.id) !== id),
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

  const handleOrderUpdate = (updatedOrder) => {
    setSelectedOrder(updatedOrder);
    // Proactively refresh dashboard data when an order is updated locally
    preFetchDashboardData(true);
  };

  const handleViewProfile = (collector) => {
    setSelectedCollector(collector);
    setActiveView("collectorProduct");
  };

  // --- Unified Dashboard Logic ---

  // 1. Transactions Logic (Merging Ledger + Orders for real-time clarity)
  const recentTransactions = React.useMemo(() => {
    if (!walletData) return [];

    const transactionsMap = new Map();

    // A. Process Ledger Entries (Source of truth for actual financial movements)
    if (walletData.ledger) {
      walletData.ledger.forEach((entry) => {
        let status = entry.status || "Completed";
        const isOnline = ["eSewa", "Khalti"].includes(entry.paymentMethod);

        // Refine Status based on User Request
        if (isOnline && status === "Locked") status = "Paid & Locked";
        else if (status === "Completed") {
          status = entry.type === "Credit" ? "Received" : "Paid";
        }

        transactionsMap.set(entry.orderID || entry._id, {
          _id: entry._id,
          date: entry.date,
          description: entry.description || entry.type,
          amount: entry.amount,
          status: status,
          method: entry.paymentMethod || "N/A",
          orderID: entry.orderID,
          source: "Ledger",
        });
      });
    }

    // B. Supplement with Orders (Ensure fresh or Pending COD orders are visible)
    const allOrdersList = [
      ...(orders.placed || []),
      ...(orders.received || []),
    ];
    allOrdersList.forEach((order) => {
      // If order is not in ledger yet (common for fresh COD or initialization)
      if (!transactionsMap.has(order.orderID)) {
        const isBuyer =
          String(order.buyerID?._id || order.buyerID) === String(userID);
        let status = order.status;

        // Map status for orders not yet in ledger
        if (status === "Delivered") {
          status = isBuyer ? "Paid" : "Received";
        } else if (order.paymentMethod === "COD" && status === "Pending") {
          status = "Pending";
        }

        transactionsMap.set(order.orderID, {
          _id: order._id,
          date: order.createdAt,
          description: `${isBuyer ? "Purchase" : "Sale"}: ${order.orderID}`,
          amount: isBuyer ? -order.totalAmount : order.totalAmount,
          status: status,
          method: order.paymentMethod || "COD",
          orderID: order.orderID,
          source: "Orders",
        });
      }
    });

    return Array.from(transactionsMap.values())
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [walletData, orders, userID]);

  // 2. Orders Logic
  const allOrders = [...(orders.placed || []), ...(orders.received || [])];
  const recentOrders = allOrders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // 3. Metrics Calculations
  const totalEarnings = (orders.received || [])
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalPurchasesAmount = (orders.placed || [])
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrdersCount = allOrders.length;

  const totalInventoryItems = (ownInventory || []).length;

  // 4. Inventory Snapshot Logic
  const lowStockProducts = (ownInventory || [])
    .filter((p) => p.quantity < 20)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 5. Order Status Logic for Pie Chart
  const orderStatusData = React.useMemo(() => {
    const statusMap = {
      Pending: { value: 0, color: "#f1c40f" },
      Active: { value: 0, color: "#3498db" },
      Delivered: { value: 0, color: "#1dc956" },
      Canceled: { value: 0, color: "#e74c3c" },
    };

    allOrders.forEach((order) => {
      const status = order.status;
      if (["Accepted", "Processing", "Shipping"].includes(status)) {
        statusMap.Active.value += 1;
      } else if (statusMap[status]) {
        statusMap[status].value += 1;
      } else if (status === "Rejected") {
        statusMap.Canceled.value += 1;
      }
    });

    return Object.keys(statusMap)
      .filter((k) => statusMap[k].value > 0)
      .map((k) => ({
        name: k,
        value: statusMap[k].value,
        color: statusMap[k].color,
      }));
  }, [allOrders]);

  // 6. Analytics Trends Logic (Sales Trend)
  const salesTrendData = React.useMemo(() => {
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
    const validStatuses = ["delivered", "accepted", "processing", "shipping"];

    (orders.received || []).forEach((order) => {
      const isDelivered = (order.status || "").toLowerCase() === "delivered";
      const isPaid = ["paid", "completed"].includes(
        (order.paymentStatus || "").toLowerCase(),
      );

      if (!isDelivered || !isPaid) return;

      const m = new Date(order.createdAt).getMonth();
      if (isNaN(m)) return;

      order.products.forEach((p) => {
        const qty = Number(p.quantity) || 0;
        const cat = (p.category || "").toLowerCase();
        if (cat.includes("fruit")) data[m].fruits += qty;
        else data[m].vegetables += qty;
      });
    });
    return data;
  }, [orders.received]);

  // 7. Analytics Trends Logic (Purchase Trend)
  const purchaseTrendData = React.useMemo(() => {
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
    const validStatuses = ["delivered", "accepted", "processing", "shipping"];

    (orders.placed || []).forEach((order) => {
      const isDelivered = (order.status || "").toLowerCase() === "delivered";
      const isPaid = ["paid", "completed"].includes(
        (order.paymentStatus || "").toLowerCase(),
      );

      if (!isDelivered || !isPaid) return;

      const m = new Date(order.createdAt).getMonth();
      if (isNaN(m)) return;

      order.products.forEach((p) => {
        const qty = Number(p.quantity) || 0;
        const cat = (p.category || "").toLowerCase();
        if (cat.includes("fruit")) data[m].fruits += qty;
        else data[m].vegetables += qty;
      });
    });
    return data;
  }, [orders.placed]);

  const overviewDemandData =
    (orders.received || []).length > 0
      ? // Top 5 products sold by the collector
        Object.entries(
          (orders.received || []).reduce((acc, order) => {
            order.products.forEach(
              (p) =>
                (acc[p.productName] = (acc[p.productName] || 0) + p.quantity),
            );
            return acc;
          }, {}),
        )
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      : [];

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
              activeView === "payments" ? "active" : ""
            }`}
            onClick={() => {
              setActiveView("payments");
              setSelectedCollector(null);
              setIsSidebarOpen(false);
            }}
          >
            <FaWallet /> Payments
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
          <div className="sd-profile-container">
            <img
              src={
                user.profileImage ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn"
              }
              alt="Profile"
              className="sd-profile-pic"
            />
            <div className="sd-profile-tooltip">
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
                  <span className="sd-stat-title">Total Sales</span>
                  <TbCurrencyRupeeNepalese className="sd-stat-icon" />
                </div>
                <div className="sd-stat-value">
                  Rs. {totalEarnings.toLocaleString()}
                </div>
                <div className="sd-stat-footer">Revenue from sold products</div>
              </div>

              <div className="sd-stat-card sd-card-orange">
                <div className="sd-stat-header">
                  <span className="sd-stat-title">Total Purchases</span>
                  <FaShoppingCart className="sd-stat-icon" />
                </div>
                <div className="sd-stat-value">
                  Rs. {totalPurchasesAmount.toLocaleString()}
                </div>
                <div className="sd-stat-footer">Expenses on Collectors</div>
              </div>

              <div className="sd-stat-card sd-card-blue">
                <div className="sd-stat-header">
                  <span className="sd-stat-title">Total Orders</span>
                  <FaShoppingCart className="sd-stat-icon" />
                </div>
                <div className="sd-stat-value">{totalOrdersCount}</div>
                <div className="sd-stat-footer">Placed & Received</div>
              </div>

              <div className="sd-stat-card sd-card-purple">
                <div className="sd-stat-header">
                  <span className="sd-stat-title">Inventory Items</span>
                  <FaBoxes className="sd-stat-icon" />
                </div>
                <div className="sd-stat-value">{totalInventoryItems}</div>
                <div className="sd-stat-footer">Stored in warehouse</div>
              </div>
            </section>

            <div className="sd-quick-actions-container">
              <div className="sd-quick-actions">
                <button
                  onClick={() => {
                    setActiveView("inventory");
                    setInventorySubView("add");
                  }}
                  className="qa-btn"
                >
                  <FaBoxes /> Add Inventory
                </button>
                <button
                  onClick={() => setActiveView("orders")}
                  className="qa-btn"
                >
                  <FaShoppingCart /> View Orders
                </button>
                <button
                  onClick={() => setActiveView("collectors")}
                  className="qa-btn"
                >
                  <FaUsers /> Collectors List
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
            <div className="sd-content-rows">
              {/* Row 1: Recent Orders + Inventory Snapshot */}
              <div className="sd-layout-row">
                <section className="sd-section-block sd-recent-orders">
                  <div className="sd-section-header">
                    <h3>Recent Orders</h3>
                    <button
                      className="sd-action-btn"
                      onClick={() => setActiveView("orders")}
                    >
                      View All
                    </button>
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="sd-empty-state">
                      <FaShoppingCart
                        size={40}
                        style={{ color: "#cbd5e0", marginBottom: "1rem" }}
                      />
                      <p>No orders yet.</p>
                      <span>
                        New orders from customers or Collectors will appear
                        here.
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="sd-table-container">
                        <table className="sd-table">
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
                            {recentOrders.map((order) => {
                              const isPlaced =
                                String(order.buyerID?._id || order.buyerID) ===
                                String(userID);
                              return (
                                <tr key={order._id}>
                                  <td>{order.orderID}</td>
                                  <td>
                                    <span
                                      className={`role-badge ${isPlaced ? "buyer" : "seller"}`}
                                    >
                                      {isPlaced ? "Placed" : "Received"}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      className={`status-badge ${order.status.toLowerCase()}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td
                                    className={`font-medium ${isPlaced ? "text-red-600" : "text-green-600"}`}
                                  >
                                    Rs. {order.totalAmount.toLocaleString()}
                                  </td>
                                  <td>
                                    <button
                                      className="sd-action-btn"
                                      onClick={() =>
                                        handleViewOrder(
                                          order,
                                          isPlaced ? "placed" : "received",
                                        )
                                      }
                                    >
                                      Details
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="sd-mobile-cards">
                        {recentOrders.map((order) => {
                          const isPlaced =
                            String(order.buyerID?._id || order.buyerID) ===
                            String(userID);
                          return (
                            <div
                              key={order._id}
                              className="sd-mobile-order-card"
                            >
                              <div className="card-row">
                                <span className="card-label">Order ID:</span>
                                <span className="card-val">
                                  {order.orderID}
                                </span>
                              </div>
                              <div className="card-row">
                                <span className="card-label">Type:</span>
                                <span
                                  className={`role-badge ${isPlaced ? "buyer" : "seller"}`}
                                >
                                  {isPlaced ? "Placed" : "Received"}
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
                                <span className="card-label">Total:</span>
                                <span
                                  className={`card-val font-medium ${isPlaced ? "text-red-600" : "text-green-600"}`}
                                >
                                  Rs. {order.totalAmount.toLocaleString()}
                                </span>
                              </div>
                              <button
                                className="sd-action-btn"
                                style={{ width: "100%", marginTop: "0.5rem" }}
                                onClick={() =>
                                  handleViewOrder(
                                    order,
                                    isPlaced ? "placed" : "received",
                                  )
                                }
                              >
                                View Details
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </section>

                {/* Own Inventory Snapshot Widget */}
                <div className="sd-widget-card sd-inventory-widget">
                  <div className="sd-widget-header">
                    <h3>Your Inventory</h3>
                  </div>
                  {
                    <div className="sd-inventory-list-wrapper">
                      <div className="sd-inventory-list scrollable-no-bar">
                        {lowStockProducts.length > 0 ? (
                          lowStockProducts.map((p) => {
                            const isOutOfStock = p.quantity === 0;
                            return (
                              <div
                                key={p._id}
                                className={`sd-inv-item ${isOutOfStock ? "out-of-stock" : "low-stock"}`}
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
                          <div className="sd-good-state">
                            <FaCheckCircle
                              style={{
                                color: "#1dc956",
                                fontSize: "2rem",
                                marginBottom: "0.5rem",
                              }}
                            />
                            <p style={{ fontWeight: "600", color: "#16a34a" }}>
                              Stock is Healthy
                            </p>
                            <span
                              style={{ fontSize: "0.85rem", color: "#718096" }}
                            >
                              All items have sufficient levels.
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        className="sd-action-btn inv-manage-btn"
                        onClick={() => setActiveView("inventory")}
                      >
                        Manage Inventory
                      </button>
                    </div>
                  }
                </div>
              </div>

              {/* Row 2: Recent Transactions + Sales Trends Chart */}
              <div className="sd-layout-row">
                <section className="sd-section-block sd-recent-transactions">
                  <div className="sd-section-header">
                    <h3>Recent Transactions</h3>
                    <button
                      className="sd-action-btn"
                      onClick={() => setActiveView("payments")}
                    >
                      View All
                    </button>
                  </div>

                  {recentTransactions.length === 0 ? (
                    <div className="sd-empty-state">
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
                      <div className="sd-table-container">
                        <table className="sd-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Status</th>
                              <th>Method</th>
                              <th>Amount</th>
                              <th>Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentTransactions.map((t, idx) => (
                              <tr key={t._id || idx}>
                                <td>{new Date(t.date).toLocaleDateString()}</td>
                                <td>
                                  <span
                                    className={`status-badge ${
                                      t.status
                                        ?.toLowerCase()
                                        .replace(/\s+/g, "-")
                                        .replace(/[^\w-]/g, "") || "completed"
                                    }`}
                                  >
                                    {t.status || "Completed"}
                                  </span>
                                </td>
                                <td className="font-medium text-gray-600">
                                  {t.method || "COD"}
                                </td>
                                <td
                                  className={`font-medium ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}
                                >
                                  Rs. {Math.abs(t.amount).toLocaleString()}
                                </td>
                                <td>{t.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="sd-mobile-cards">
                        {recentTransactions.map((t, idx) => (
                          <div
                            key={t._id || idx}
                            className="sd-mobile-order-card"
                          >
                            <div className="card-row">
                              <span className="card-label">Date:</span>
                              <span className="card-val">
                                {new Date(t.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Method:</span>
                              <span className="card-val font-medium">
                                {t.method || "COD"}
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Status:</span>
                              <span
                                className={`status-badge ${
                                  t.status
                                    ?.toLowerCase()
                                    .replace(/\s+/g, "-")
                                    .replace(/[^\w-]/g, "") || "completed"
                                }`}
                              >
                                {t.status || "Completed"}
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Amount:</span>
                              <span
                                className={`card-val font-medium ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}
                              >
                                Rs. {Math.abs(t.amount).toLocaleString()}
                              </span>
                            </div>
                            <div className="card-row">
                              <span className="card-label">Desc:</span>
                              <span className="card-val">{t.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>

                <div className="sd-widget-card chart-widget sd-trend-widget">
                  <div className="sd-widget-header">
                    <h3>Sales Trend</h3>
                  </div>
                  <div
                    style={{ width: "100%", height: "100%", minHeight: 300 }}
                  >
                    {salesTrendData.some(
                      (d) => d.fruits > 0 || d.vegetables > 0,
                    ) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={salesTrendData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                            allowDecimals={false}
                          />
                          <Tooltip />
                          <Legend
                            verticalAlign="top"
                            align="right"
                            height={36}
                            wrapperStyle={{ fontSize: "10px" }}
                          />
                          <Line
                            type="monotone"
                            name="Vegetables"
                            dataKey="vegetables"
                            stroke="#1dc956"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            name="Fruits"
                            dataKey="fruits"
                            stroke="#f1c40f"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="sd-empty-chart">
                        <FaChartLine size={48} />
                        <p>No sales activity yet</p>
                        <span>
                          Sales data will appear here once orders are processed.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Purchase Trends + Order Status Pie Chart */}
              <div className="sd-layout-row">
                <div className="sd-widget-card chart-widget sd-trend-widget">
                  <div className="sd-widget-header">
                    <h3>Purchase Trend</h3>
                  </div>
                  <div
                    style={{ width: "100%", height: "100%", minHeight: 300 }}
                  >
                    {purchaseTrendData.some(
                      (d) => d.fruits > 0 || d.vegetables > 0,
                    ) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={purchaseTrendData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                            allowDecimals={false}
                          />
                          <Tooltip />
                          <Legend
                            verticalAlign="top"
                            align="right"
                            height={36}
                            wrapperStyle={{ fontSize: "10px" }}
                          />
                          <Line
                            type="monotone"
                            name="Vegetables"
                            dataKey="vegetables"
                            stroke="#3498db"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            name="Fruits"
                            dataKey="fruits"
                            stroke="#e67e22"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="sd-empty-chart">
                        <FaShoppingBag size={48} />
                        <p>No purchase activity yet</p>
                        <span>
                          Purchase history will be visualized here.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sd-widget-card chart-widget status-pie-widget">
                  <div className="sd-widget-header">
                    <h3>Overall Order Status</h3>
                  </div>
                  <div
                    style={{ width: "100%", height: "100%", minHeight: 300 }}
                  >
                    {orderStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend
                            verticalAlign="bottom"
                            height={40}
                            iconType="circle"
                            iconSize={10}
                            wrapperStyle={{
                              fontSize: "12px",
                              paddingTop: "10px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="sd-empty-chart">
                        <FaChartPie size={48} />
                        <p>No order data</p>
                        <span>Status distribution will show here.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === "collectors" && (
          <div className="Collectors-view-wrapper">
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
              initialInventory={ownInventory}
              onRefresh={() => {
                // Background refresh
                api
                  .get(`/inventory?userID=${userID}`)
                  .then((res) => setOwnInventory(res.data));
              }}
            />
          ) : (
            <SupplierAddInventoryView
              onBack={() => setInventorySubView("list")}
            />
          ))}
        {activeView === "orders" && (
          <OrderManagement
            onViewOrder={handleViewOrder}
            ordersPlacedProp={orders.placed}
            ordersReceivedProp={orders.received}
            onInventoryRedirect={() => {
              setActiveView("inventory");
              setInventorySubView("list");
            }}
          />
        )}
        {activeView === "orderDetail" && (
          <OrderDetailView
            order={selectedOrder}
            orderType={orderType}
            onBack={() => setActiveView("orders")}
            onOrderUpdate={handleOrderUpdate}
            onInventoryRedirect={() => {
              setActiveView("inventory");
              setInventorySubView("list");
            }}
          />
        )}
        {activeView === "payments" && <PaymentsView />}
        {activeView === "analytics" && (
          <DetailedAnalytics
            orders={orders}
            wallet={wallet}
            walletData={walletData}
            products={preFetchedCollectors}
          />
        )}
        {activeView === "settings" && <SettingsView />}
        {activeView === "notifications" && <NotificationsView />}
        {activeView === "cart" && (
          <CartView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onBack={() => setActiveView("collectors")}
            onClearCart={() => {
              setCartItems([]);
              sessionStorage.removeItem("cartItems");
              sessionStorage.removeItem("hasViewedCart");
            }}
            onOrderComplete={() => setActiveView("orders")}
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
