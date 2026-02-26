import React, { useState, useEffect } from "react";
import {
  FaLeaf,
  FaHome,
  FaUsers,
  FaTruck,
  FaShoppingBag,
  FaSignOutAlt,
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaBoxOpen,
  FaClipboardList,
  FaWallet,
  FaGavel,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import AdminOverview from "./AdminOverview";
import UserManagementView from "./UserManagementView";
import UserDetailModal from "./UserDetailModal";
import AdminOrdersView from "./AdminOrdersView";
import AdminProductsView from "./AdminProductsView";
import AdminInventoryView from "./AdminInventoryView";
import AdminWalletView from "./AdminWalletView";
import AdminDisputesView from "./AdminDisputesView";

import api from "../../../api/axiosConfig";
import { useSocket } from "../../../context/SocketContext";

const AdminDashboard = () => {
  const socket = useSocket();
  // ... (state lines)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState(
    localStorage.getItem("adminActiveView") || "dashboard",
  );
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("adminStats");
    return saved ? JSON.parse(saved) : null;
  });

  // Global Dashboard Cache
  const [dataCache, setDataCache] = useState(() => {
    const saved = localStorage.getItem("adminDataCache");
    return saved
      ? JSON.parse(saved)
      : {
          farmers: null,
          collectors: null,
          suppliers: null,
          buyers: null,
          orders: null,
          products: null,
          inventory: null,
          wallets: null,
          codLedger: null,
          withdrawals: null,
          disputes: null,
        };
  });

  const updateCache = (key, data) => {
    if (typeof key === "object" && data === undefined) {
      setDataCache((prev) => ({ ...prev, ...key }));
    } else {
      setDataCache((prev) => ({ ...prev, [key]: data }));
    }
  };

  // Refresh trigger for UserManagementView
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState(
    JSON.parse(localStorage.getItem("adminExpandedSections")) || {
      management: false,
      operations: false,
      financial: false,
    },
  );

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ... (useEffects)
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("adminActiveView", activeView);
    localStorage.setItem(
      "adminExpandedSections",
      JSON.stringify(expandedSections),
    );
    localStorage.setItem("adminDataCache", JSON.stringify(dataCache));
    if (stats) {
      localStorage.setItem("adminStats", JSON.stringify(stats));
    }
  }, [activeView, expandedSections, dataCache, stats]);

  // Optimized Prefetch Logic
  const preFetchAdminData = React.useCallback(async (isSilent = false) => {
    try {
      if (!isSilent && !stats) {
        // Only show major loading if we have literally no data
      }

      const ts = Date.now();

      // 1. Stats with cache busting
      const statsRes = await api.get(`/admin/stats?v=${ts}`);
      setStats(statsRes.data);
      localStorage.setItem("adminStats", JSON.stringify(statsRes.data));

      // 2. Parallel Background Fetch
      Promise.allSettled([
        api
          .get(`/admin/users?role=farmer&v=${ts}`)
          .then((res) => updateCache("farmers", res.data)),
        api
          .get(`/admin/users?role=collector&v=${ts}`)
          .then((res) => updateCache("collectors", res.data)),
        api
          .get(`/admin/users?role=supplier&v=${ts}`)
          .then((res) => updateCache("suppliers", res.data)),
        api
          .get(`/admin/users?role=buyer&v=${ts}`)
          .then((res) => updateCache("buyers", res.data)),
        api
          .get(`/admin/orders?v=${ts}`)
          .then((res) => updateCache("orders", res.data)),
        api
          .get(`/admin/products?v=${ts}`)
          .then((res) => updateCache("products", res.data)),
        api
          .get(`/admin/inventory?v=${ts}`)
          .then((res) => updateCache("inventory", res.data)),
        api
          .get(`/admin/wallets?v=${ts}`)
          .then((res) => updateCache("wallets", res.data)),
        api
          .get(`/admin/cod-ledger?v=${ts}`)
          .then((res) => updateCache("codLedger", res.data)),
        api
          .get(`/admin/withdrawals?v=${ts}`)
          .then((res) => updateCache("withdrawals", res.data)),
        api
          .get(`/admin/disputes?v=${ts}`)
          .then((res) => updateCache("disputes", res.data)),
        api
          .get(`/admin/online-transactions?v=${ts}`)
          .then((res) => updateCache("onlineTransactions", res.data)),
      ]);

      console.log(
        `>>> Admin sync complete (${isSilent ? "Silent" : "Full"}) - ${new Date().toLocaleTimeString()}`,
      );
    } catch (err) {
      console.error("Error prefetching admin data", err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    preFetchAdminData(!!stats); // Silent if we already have stats

    // Real-time socket updates
    if (socket) {
      // 1. Enforce Admin Room Join (in case Provider missed it or role changed)
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "admin") {
        socket.emit("join-room", { userId: user._id, role: "admin" });
        console.log(">>> [Admin Dashboard] Explicitly joined 'admin' room");
      }

      const handleGlobalUpdate = (data) => {
        console.log(
          ">>> [Admin Socket] Global update received:",
          data.type,
          data,
        );

        // Instant Update for Recent Activities
        if (data.type === "ACTIVITY_LOGGED" && data.activity) {
          setStats((prevStats) => {
            if (!prevStats) return prevStats;
            const newActivities = [
              data.activity,
              ...(prevStats.recentActivity || []),
            ].slice(0, 20);
            return { ...prevStats, recentActivity: newActivities };
          });
        }

        // Trigger full data refresh (silent)
        preFetchAdminData(true);
      };

      socket.on("order:new", handleGlobalUpdate);
      socket.on("dashboard:update", handleGlobalUpdate);
      socket.on("user:register", handleGlobalUpdate);

      return () => {
        socket.off("order:new", handleGlobalUpdate);
        socket.off("dashboard:update", handleGlobalUpdate);
        socket.off("user:register", handleGlobalUpdate);
      };
    }
  }, [socket, preFetchAdminData]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className={`ad-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        {/* ... Sidebar Header ... */}
        <div className="ad-sidebar-header-mobile">
          <div className="ad-logo">
            <FaLeaf /> <span>AgroMart</span>
          </div>
        </div>

        <nav className="ad-nav">
          {/* Dashboard - Always visible */}
          <div
            className={`ad-nav-item ${activeView === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveView("dashboard")}
          >
            <FaHome className="ad-nav-icon" /> Dashboard
          </div>

          {/* Management Section */}
          <div className="ad-nav-section">
            <div
              className="ad-nav-section-header"
              onClick={() => toggleSection("management")}
            >
              <div className="ad-nav-section-title">
                <FaUsers className="ad-nav-icon" /> Management
              </div>
              <FaChevronDown
                className={`ad-nav-chevron ${expandedSections.management ? "expanded" : ""}`}
              />
            </div>
            {expandedSections.management && (
              <div className="ad-nav-section-items">
                <div
                  className={`ad-nav-item ${activeView === "farmers" ? "active" : ""}`}
                  onClick={() => setActiveView("farmers")}
                >
                  <FaUsers className="ad-nav-icon" /> Farmers
                </div>
                <div
                  className={`ad-nav-item ${activeView === "collectors" ? "active" : ""}`}
                  onClick={() => setActiveView("collectors")}
                >
                  <FaTruck className="ad-nav-icon" /> Collectors
                </div>
                <div
                  className={`ad-nav-item ${activeView === "suppliers" ? "active" : ""}`}
                  onClick={() => setActiveView("suppliers")}
                >
                  <FaTruck
                    className="ad-nav-icon"
                    style={{ transform: "scaleX(-1)" }}
                  />{" "}
                  Suppliers
                </div>
                <div
                  className={`ad-nav-item ${activeView === "buyers" ? "active" : ""}`}
                  onClick={() => setActiveView("buyers")}
                >
                  <FaShoppingBag className="ad-nav-icon" /> Buyers
                </div>
              </div>
            )}
          </div>

          {/* Operations Section */}
          <div className="ad-nav-section">
            <div
              className="ad-nav-section-header"
              onClick={() => toggleSection("operations")}
            >
              <div className="ad-nav-section-title">
                <FaClipboardList className="ad-nav-icon" /> Operations
              </div>
              <FaChevronDown
                className={`ad-nav-chevron ${expandedSections.operations ? "expanded" : ""}`}
              />
            </div>
            {expandedSections.operations && (
              <div className="ad-nav-section-items">
                <div
                  className={`ad-nav-item ${activeView === "orders" ? "active" : ""}`}
                  onClick={() => setActiveView("orders")}
                >
                  <FaClipboardList className="ad-nav-icon" /> Orders
                </div>
                <div
                  className={`ad-nav-item ${activeView === "products" ? "active" : ""}`}
                  onClick={() => setActiveView("products")}
                >
                  <FaBoxOpen className="ad-nav-icon" /> Products
                </div>
                <div
                  className={`ad-nav-item ${activeView === "inventory" ? "active" : ""}`}
                  onClick={() => setActiveView("inventory")}
                >
                  <FaBoxOpen className="ad-nav-icon" /> Inventory
                </div>
              </div>
            )}
          </div>

          {/* Financial Section */}
          <div className="ad-nav-section">
            <div
              className="ad-nav-section-header"
              onClick={() => toggleSection("financial")}
            >
              <div className="ad-nav-section-title">
                <FaWallet className="ad-nav-icon" /> Financial
              </div>
              <FaChevronDown
                className={`ad-nav-chevron ${expandedSections.financial ? "expanded" : ""}`}
              />
            </div>
            {expandedSections.financial && (
              <div className="ad-nav-section-items">
                <div
                  className={`ad-nav-item ${activeView === "wallet" ? "active" : ""}`}
                  onClick={() => setActiveView("wallet")}
                >
                  <FaWallet className="ad-nav-icon" /> Wallet / COD
                </div>
              </div>
            )}
          </div>

          {/* Disputes - Always visible */}
          <div
            className={`ad-nav-item ${activeView === "disputes" ? "active" : ""}`}
            onClick={() => setActiveView("disputes")}
          >
            <FaGavel className="ad-nav-icon" /> Disputes
          </div>
        </nav>

        <div className="ad-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </div>
      </aside>

      {/* Main Content */}
      <main className="ad-main">
        {/* ... Header ... */}
        <header className="ad-header">
          <button
            className={`ad-sidebar-toggle ${isSidebarOpen ? "sidebar-open" : ""}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
          <span className="ad-breadcrumbs">
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Overview
          </span>
          <div className="ad-header-right">
            <div className="ad-profile">
              <img
                src="https://ui-avatars.com/api/?name=Admin+User&background=2E8B57&color=fff"
                alt=""
                className="ad-avatar"
              />
              <div className="ad-profile-info">
                <span className="ad-profile-name">AgroMart Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="ad-content-area">
          {activeView === "dashboard" && (
            <AdminOverview key="dashboard" stats={stats} />
          )}

          {["farmers", "collectors", "suppliers", "buyers"].includes(
            activeView,
          ) && (
            <UserManagementView
              key={activeView}
              role={
                activeView.slice(0, -1).charAt(0).toUpperCase() +
                activeView.slice(0, -1).slice(1)
              }
              onViewDetails={setSelectedUser}
              refreshTrigger={refreshTrigger}
              cache={dataCache[activeView]}
              onCacheUpdate={(data) => updateCache(activeView, data)}
            />
          )}

          {activeView === "orders" && (
            <AdminOrdersView
              key="orders"
              cache={dataCache.orders}
              onCacheUpdate={(data) => updateCache("orders", data)}
            />
          )}
          {activeView === "products" && (
            <AdminProductsView
              key="products"
              cache={dataCache.products}
              onCacheUpdate={(data) => updateCache("products", data)}
            />
          )}
          {activeView === "inventory" && (
            <AdminInventoryView
              key="inventory"
              cache={dataCache.inventory}
              onCacheUpdate={(data) => updateCache("inventory", data)}
            />
          )}
          {activeView === "wallet" && (
            <AdminWalletView
              key="wallet"
              walletsCache={dataCache.wallets}
              codCache={dataCache.codLedger}
              withdrawalsCache={dataCache.withdrawals}
              onlineCache={dataCache.onlineTransactions}
              onCacheUpdate={updateCache}
            />
          )}
          {activeView === "disputes" && (
            <AdminDisputesView
              key="disputes"
              cache={dataCache.disputes}
              onCacheUpdate={(data) => updateCache("disputes", data)}
            />
          )}
        </div>
      </main>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
