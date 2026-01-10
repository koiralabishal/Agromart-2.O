import React, { useState } from "react";
import {
  FaLeaf,
  FaHome,
  FaUsers,
  FaTruck,
  FaShoppingBag,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import AdminOverview from "./AdminOverview";
import UserManagementView from "./UserManagementView";
import UserDetailModal from "./UserDetailModal";

// Mock Data for different roles
const mockFarmers = [
  {
    id: 1,
    name: "Bishal Koirala",
    email: "bslkoirala@gmail.com",
    phone: "9841234567",
    status: "Verified",
    businessName: "Koirala Farms",
    docStatus: "Approved",
    location: "Pokhara, Nepal",
    documentUrl:
      "https://res.cloudinary.com/delqlxp6s/image/upload/v1767625082/documents/ivgift52pfcr2njalakv.jpg",
    documentType: "image",
    documentName: "Koirala_Farms_License.jpg",
  },
  {
    id: 2,
    name: "Ram Thapa",
    email: "ram.thapa@example.com",
    phone: "9812345678",
    status: "Unverified",
    businessName: "Himalayan Organic",
    docStatus: "Pending",
    location: "Mustang, Nepal",
    documentUrl:
      "https://res.cloudinary.com/delqlxp6s/image/upload/v1767625082/documents/ivgift52pfcr2njalakv.jpg",
    documentType: "image",
    documentName: "Himalayan_Organic_License.jpg",
  },
  {
    id: 3,
    name: "Sita Sharma",
    email: "sita.s@example.com",
    phone: "9801234567",
    status: "Verified",
    businessName: "Green Valley",
    docStatus: "Approved",
    location: "Chitwan, Nepal",
    documentUrl:
      "https://res.cloudinary.com/delqlxp6s/image/upload/v1767625082/documents/ivgift52pfcr2njalakv.jpg",
    documentType: "image",
    documentName: "Green_Valley_License.jpg",
  },
];

const mockCollectors = [
  {
    id: 1,
    name: "Hari Bahadur",
    email: "hari.b@example.com",
    phone: "9865432109",
    status: "Verified",
    businessName: "Pokhara Collection Center",
    docStatus: "Approved",
    location: "Pokhara, Nepal",
    documentUrl:
      "https://res.cloudinary.com/delqlxp6s/image/upload/v1767625082/documents/ivgift52pfcr2njalakv.jpg",
    documentType: "image",
    documentName: "Pokhara_Collection_Center_License.jpg",
  },
  {
    id: 2,
    name: "Gita Magar",
    email: "gita.m@example.com",
    phone: "9845678901",
    status: "Unverified",
    businessName: "Gandaki Aggregators",
    docStatus: "Pending",
    location: "Syangja, Nepal",
    documentUrl:
      "https://res.cloudinary.com/delqlxp6s/image/upload/v1767625082/documents/ivgift52pfcr2njalakv.jpg",
    documentType: "image",
    documentName: "Gandaki_Aggregators_License.jpg",
  },
];

const mockSuppliers = [
  {
    id: 1,
    name: "ABC Logistics",
    email: "contact@abclogistics.com",
    phone: "01-4455667",
    status: "Verified",
    businessName: "ABC Logistics Pvt Ltd",
    docStatus: "Approved",
    location: "Kathmandu, Nepal",
    documentUrl:
      "https://res.cloudinary.com/delqlxp6s/image/upload/v1767625082/documents/ivgift52pfcr2njalakv.jpg",
    documentType: "image",
    documentName: "ABC_Logistics_Pvt_Ltd_License.jpg",
  },
];

const mockBuyers = [
  {
    id: 1,
    name: "Hotel Annapurna",
    email: "purchasing@annapurna.com",
    phone: "01-5544332",
    status: "Verified",
    businessName: "Hotel Annapurna",
    location: "Kathmandu, Nepal",
  },
  {
    id: 2,
    name: "Bhojan Griha",
    email: "info@bhojan.com",
    phone: "01-6677889",
    status: "Verified",
    businessName: "Bhojan Griha",
    location: "Lalitpur, Nepal",
  },
];

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate(); // Hook

  // ... (existing handlers)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      let activeViewKey = "adminActiveView"; // Example key if we were persisting state
      sessionStorage.removeItem(activeViewKey);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleVerifyUser = (user) => {
    alert(`Verified user: ${user.name}`);
    setSelectedUser(null);
  };

  const handleRejectUser = (user) => {
    alert(`Rejected user: ${user.name}`);
    setSelectedUser(null);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className={`ad-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="ad-sidebar-header-mobile">
          <div className="ad-logo">
            <FaLeaf /> <span>AgroMart</span>
          </div>
          {/* <button className="ad-sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
                <FaChevronLeft />
            </button> */}
        </div>

        <nav className="ad-nav">
          <div
            className={`ad-nav-item ${
              activeView === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveView("dashboard")}
          >
            <FaHome className="ad-nav-icon" /> Dashboard
          </div>
          <div
            className={`ad-nav-item ${
              activeView === "farmers" ? "active" : ""
            }`}
            onClick={() => setActiveView("farmers")}
          >
            <FaUsers className="ad-nav-icon" /> Farmers
          </div>
          <div
            className={`ad-nav-item ${
              activeView === "collectors" ? "active" : ""
            }`}
            onClick={() => setActiveView("collectors")}
          >
            <FaTruck className="ad-nav-icon" /> Collectors
          </div>
          <div
            className={`ad-nav-item ${
              activeView === "suppliers" ? "active" : ""
            }`}
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
        </nav>

        <div className="ad-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </div>
      </aside>

      {/* Main Content */}
      <main className="ad-main">
        {/* Header */}
        <header className="ad-header">
          <div className="ad-header-left">
            <button
              className={`ad-sidebar-toggle ${
                isSidebarOpen ? "sidebar-open" : ""
              }`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
            <span className="ad-breadcrumbs">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}{" "}
              Overview
            </span>
          </div>

          <div className="ad-header-right">
            {/* <div className="ad-search-bar">
                            <FaSearch color="#9CA3AF" />
                            <input type="text" placeholder="Search..." />
                        </div> */}
            <div className="ad-profile">
              <img
                src="https://ui-avatars.com/api/?name=Admin+A&background=random"
                alt="Admin"
                className="ad-avatar"
              />
              <div className="ad-profile-info">
                <span className="ad-profile-name">AgroMart Admin</span>
                <span className="ad-profile-role">System Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="ad-content-area">
          {activeView === "dashboard" && <AdminOverview />}
          {activeView === "farmers" && (
            <UserManagementView
              role="Farmer"
              data={mockFarmers}
              onViewDetails={handleViewDetails}
            />
          )}
          {activeView === "collectors" && (
            <UserManagementView
              role="Collector"
              data={mockCollectors}
              onViewDetails={handleViewDetails}
            />
          )}
          {activeView === "suppliers" && (
            <UserManagementView
              role="Supplier"
              data={mockSuppliers}
              onViewDetails={handleViewDetails}
            />
          )}
          {activeView === "buyers" && (
            <UserManagementView
              role="Buyer"
              data={mockBuyers}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={handleCloseModal}
          onVerify={handleVerifyUser}
          onReject={handleRejectUser}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
