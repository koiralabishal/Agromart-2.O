import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFileExport,
  FaEye,
  FaTrash,
  FaUsers,
  FaCheckCircle,
  FaUserTimes,
  FaUserShield, // For Admin actions
} from "react-icons/fa";
import api from "../../../api/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../Common/Pagination";
import ConfirmationModal from "../../Common/ConfirmationModal";

const UserManagementView = ({
  role,
  onViewDetails,
  refreshTrigger,
  cache,
  onCacheUpdate,
}) => {
  const [users, setUsers] = useState(cache || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(!cache);
  const [currentPage, setCurrentPage] = useState(1);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  // Profile Image Modal
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (cache) {
      setUsers(cache);
    }
  }, [cache]);

  useEffect(() => {
    fetchUsers();
  }, [role, refreshTrigger]);

  const fetchUsers = async () => {
    if (!cache) setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${role.toLowerCase()}`);
      if (Array.isArray(res.data)) {
        setUsers(res.data);
        onCacheUpdate(res.data);
      } else {
        console.error("API Error: Expected array but got", res.data);
        setUsers([]);
        toast.error("Failed to load users: Invalid data format");
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
      toast.error("Network error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action, user) => {
    if (action === "verify") {
      setConfirmModal({
        isOpen: true,
        title: "Verify User Documents?",
        message: `Are you sure you want to verify docs for ${user.name}?`,
        type: "success",
        onConfirm: () => performVerify(user),
      });
    } else if (action === "delete") {
      setConfirmModal({
        isOpen: true,
        title: "Delete User?",
        message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        type: "danger",
        confirmBtnText: "Yes, Delete",
        onConfirm: () => performDelete(user),
      });
    }
  };

  const performVerify = async (user) => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      await api.put(`/admin/users/${user._id}/verify`, {
        docStatus: "Approved",
      });
      toast.success(`User documents verified!`, { position: "top-right" });
      fetchUsers();
    } catch (err) {
      toast.error("Verification failed");
    }
  };

  const performDelete = async (user) => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      await api.delete(`/admin/users/${user._id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const filteredData = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const itemsPerPage = 10;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const showDocStatus = ["Farmer", "Collector", "Supplier"].includes(role);

  return (
    <div className="user-management-view">
      <ToastContainer />
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmBtnText={confirmModal.confirmBtnText}
      />

      {/* Profile Image Preview Modal */}
      {previewImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Profile Preview"
            style={{ maxHeight: "80vh", maxWidth: "90vw", borderRadius: "8px" }}
          />
        </div>
      )}

      <div className="um-header">
        <h2 className="um-title">{role} Management</h2>
        <div className="um-actions">
          <div className="ad-search-bar">
            <FaSearch color="#9CA3AF" />
            <input
              type="text"
              placeholder={`Search ${role.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="um-export-btn">
            <FaFileExport style={{ marginRight: "8px" }} /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="ad-stats-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 300px))",
        }}
      >
        <div className="ad-stat-card">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Total {role}s</span>
            <FaUsers className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">{users.length}</div>
        </div>
      </div>

      <div className="um-table-container">
        {loading && !cache ? (
          <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
        ) : (
          <table className="um-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Profile Image</th>
                <th>Account Status</th>
                {showDocStatus && <th>Document Status</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                      }}
                    >
                      <img
                        src={
                          user.profileImage ||
                          `https://ui-avatars.com/api/?name=${user.name}&background=random`
                        }
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: "50%" }}
                      />
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      className="um-action-btn btn-view"
                      onClick={() =>
                        setPreviewImage(
                          user.profileImage ||
                            `https://ui-avatars.com/api/?name=${user.name}&background=random`,
                        )
                      }
                      title="View Profile Image"
                    >
                      <FaEye />
                    </button>
                  </td>
                  <td>
                    <span
                      className={`um-status-badge ${user.status === "Verified" ? "status-verified" : "status-unverified"}`}
                    >
                      {user.status || "Unverified"}
                    </span>
                  </td>
                  {showDocStatus && (
                    <td>
                      <span
                        className={`um-status-badge ${user.docStatus === "Approved" ? "status-approved" : "status-pending"}`}
                      >
                        {user.docStatus || "Pending"}
                      </span>
                    </td>
                  )}
                  <td style={{ display: "flex", gap: "5px" }}>
                    <button
                      className="um-action-btn btn-view"
                      onClick={() => onViewDetails(user)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    {/* Verification Button: Only if docStatus is NOT Approved? Or always allowing re-verify? */}
                    {/* User said: "Verify and approved also change only doc status". */}
                    {/* Showing it if docStatus is not Approved seems logical. */}
                    {user.docStatus !== "Approved" && showDocStatus && (
                      <button
                        className="um-action-btn"
                        style={{ color: "green" }}
                        onClick={() => handleActionClick("verify", user)}
                        title="Approve Docs"
                      >
                        <FaUserShield />
                      </button>
                    )}
                    <button
                      className="um-action-btn btn-delete"
                      onClick={() => handleActionClick("delete", user)}
                      title="Delete User"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default UserManagementView;
