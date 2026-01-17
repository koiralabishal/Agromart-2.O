import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaCheck,
  FaBan,
  FaFileImage,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import api from "../../../api/axiosConfig";
import "./AdminDashboard.css"; // Keeping for shared styles if any
import "./UserDetailModal.css"; // New external CSS
import ConfirmationModal from "../../Common/ConfirmationModal";

const UserDetailModal = ({ user: initialUser, onClose, onUpdate }) => {
  const [user, setUser] = useState(initialUser);
  const [roleProfile, setRoleProfile] = useState(null);
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  if (!user) return null;

  useEffect(() => {
    const fetchRoleProfile = async () => {
      if (
        !initialUser ||
        initialUser.role === "buyer" ||
        initialUser.role === "admin"
      )
        return;

      try {
        let endpoint = `/admin/users/${initialUser._id}/role-profile`;
        const res = await api.get(endpoint);
        setRoleProfile(res.data);
      } catch (err) {
        console.error("Error fetching role profile:", err);
      }
    };

    fetchRoleProfile();
  }, [initialUser]);

  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const performVerify = async () => {
    closeConfirmModal();
    try {
      await api.put(`/admin/users/${user._id}/verify`, {
        status: "Verified",
        docStatus: "Approved",
      });
      // Update local state to reflect changes immediately
      setUser({ ...user, status: "Verified", docStatus: "Approved" });
      if (onUpdate) onUpdate(); // Trigger parent refresh
    } catch (err) {
      console.error("Error verifying user", err);
    }
  };

  const performReject = async () => {
    closeConfirmModal();
    try {
      await api.put(`/admin/users/${user._id}/verify`, {
        docStatus: "Rejected",
      });
      // Update local state to reflect changes immediately
      setUser({ ...user, docStatus: "Rejected" });
      if (onUpdate) onUpdate(); // Trigger parent refresh
    } catch (err) {
      console.error("Error rejecting user", err);
    }
  };

  const handleVerifyClick = () => {
    setConfirmModal({
      isOpen: true,
      title: "Approve User?",
      message: "Are you sure you want to verify and approve this user?",
      type: "success",
      onConfirm: performVerify,
    });
  };

  const handleRejectClick = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reject User?",
      message: "Are you sure you want to reject this user?",
      type: "danger",
      onConfirm: performReject,
    });
  };

  const getDocumentName = () => {
    if (user.documentName) return user.documentName;
    return `${(user.businessName || user.name || "User").replace(
      /\s+/g,
      "_",
    )}_License.jpg`;
  };

  return (
    <div className="ud-overlay">
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
      <div className="ud-modal">
        {/* Header */}
        <div className="ud-header">
          <h2 className="ud-title">User Details</h2>
          <button onClick={onClose} className="ud-close-btn">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="ud-body">
          {/* Basic Profile Info */}
          <div className="ud-profile-grid">
            <img
              src={
                user.profileImage ||
                `https://ui-avatars.com/api/?name=${user.name}&background=10B981&color=fff&size=128`
              }
              alt={user.name}
              className="ud-profile-img"
            />
            <div style={{ flex: 1 }}>
              <div className="ud-profile-info-header">
                <h3>
                  {user.name}
                  <span className="ud-role-badge">{user.role}</span>
                </h3>
                <div className="ud-contact-row">
                  <span className="ud-contact-item">
                    <FaEnvelope /> {user.email}
                  </span>
                  <span className="ud-contact-item">
                    <FaPhone /> {user.phone || "N/A"}
                  </span>
                  <span className="ud-contact-item">
                    <FaMapMarkerAlt /> {user.address || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="ud-status-grid">
            <div className="ud-status-row">
              <span className="ud-status-label">Account Status:</span>
              <span
                className={`ud-status-value ${
                  user.status === "Verified"
                    ? "status-verified"
                    : "status-unverified"
                }`}
              >
                {user.status || "Unverified"}
              </span>
            </div>
            {user.role !== "buyer" && (
              <div className="ud-status-row">
                <span className="ud-status-label">Document Status:</span>
                <span
                  className={`ud-status-value ${
                    user.docStatus === "Approved"
                      ? "status-approved"
                      : user.docStatus === "Rejected"
                        ? "status-rejected"
                        : "status-pending"
                  }`}
                >
                  {user.docStatus || "Pending"}
                </span>
              </div>
            )}
          </div>

          {/* Documents (If any) */}
          {user.role !== "buyer" && (
            <div className="ud-docs-section">
              <h4 className="ud-docs-title">Documents</h4>
              <div className="ud-doc-card">
                <FaFileImage size={24} color="#3B82F6" />
                <span className="ud-doc-name">{getDocumentName()}</span>
                <button
                  className="ud-view-btn"
                  onClick={() => {
                    const url = roleProfile?.licenseUrl;
                    if (url) window.open(url, "_blank");
                    else alert("No license document found for this user.");
                  }}
                >
                  View
                </button>
              </div>
            </div>
          )}

          {/* Actions - Only show if NOT Approved */}
          {user.docStatus !== "Approved" && (
            <div className="ud-action-buttons">
              <button
                onClick={handleRejectClick}
                className="ud-btn ud-btn-reject"
              >
                <FaBan /> Reject
              </button>
              <button
                onClick={handleVerifyClick}
                className="ud-btn ud-btn-verify"
              >
                <FaCheck /> Verify & Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
