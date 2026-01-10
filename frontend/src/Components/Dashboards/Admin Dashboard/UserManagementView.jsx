import React, { useState } from "react";
import {
  FaSearch,
  FaFileExport,
  FaEye,
  FaTrash,
  FaUsers,
  FaCheckCircle,
  FaUserTimes,
} from "react-icons/fa";

const UserManagementView = ({ role, data, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showDocStatus = ["Farmer", "Collector", "Supplier"].includes(role);

  return (
    <div className="user-management-view">
      {/* Header */}
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

      {/* Top Stats specific to this role */}
      <div className="ad-stats-grid">
        <div className="ad-stat-card">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Total {role}s</span>
            <FaUsers className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">{data.length}</div>
          <div className="ad-stat-change">Across all regions</div>
        </div>
        <div className="ad-stat-card">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Verified</span>
            <FaCheckCircle className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">
            {data.filter((u) => u.status === "Verified").length}
          </div>
          <div className="ad-stat-change">Active members</div>
        </div>
        <div className="ad-stat-card">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Unverified</span>
            <FaUserTimes className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">
            {data.filter((u) => u.status === "Unverified").length}
          </div>
          <div className="ad-stat-change">Pending review</div>
        </div>
      </div>

      {/* Table */}
      <div className="um-table-container">
        <table className="um-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              {showDocStatus && <th>Doc Status</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((user) => (
              <tr key={user.id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                    }}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                      alt=""
                      style={{ width: 32, height: 32, borderRadius: "50%" }}
                    />
                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span
                    className={`um-status-badge ${
                      user.status === "Verified"
                        ? "status-verified"
                        : "status-unverified"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                {showDocStatus && (
                  <td>
                    <span
                      className={`um-status-badge ${
                        user.docStatus === "Approved"
                          ? "status-approved"
                          : "status-pending"
                      }`}
                    >
                      {user.docStatus || "Pending"}
                    </span>
                  </td>
                )}
                <td>
                  <button
                    className="um-action-btn btn-view"
                    onClick={() => onViewDetails(user)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="um-action-btn btn-delete"
                    title="Delete User"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementView;
