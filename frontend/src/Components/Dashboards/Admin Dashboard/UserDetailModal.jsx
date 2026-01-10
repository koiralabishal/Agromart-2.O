import React from "react";
import {
  FaTimes,
  FaCheck,
  FaBan,
  FaFileImage,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import "./AdminDashboard.css"; // Reusing some styles

// Inline styles for the modal specifically to keep it self-contained or add to CSS later
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  width: "600px",
  maxWidth: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

const UserDetailModal = ({ user, onClose, onVerify, onReject }) => {
  if (!user) return null;

  // Generate dynamic document name if not provided
  const getDocumentName = () => {
    if (user.documentName) return user.documentName;
    const baseName = (user.businessName || user.name || "User").replace(/\s+/g, "_");
    return `${baseName}_License.jpg`;
  };


  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle} className="ud-modal">
        {/* Header */}
        <div
          className="ud-header"
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1F2937" }}>
            User Verification
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "#6B7280",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* content */}
        <div className="ud-body" style={{ padding: "2rem" }}>
          {/* Profile Header */}
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}&background=1DC956&color=fff&size=128`}
              alt={user.name}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
                {user.name}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  color: "#6B7280",
                  fontSize: "0.9rem",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaMapMarkerAlt /> {user.location || "Kathmandu, Nepal"}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaEnvelope /> {user.email}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaPhone /> {user.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Farm/Business Info */}
          <div style={{ marginBottom: "2rem" }}>
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#374151",
              }}
            >
              Business Details
            </h4>
            <div
              style={{
                background: "#F9FAFB",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: "#6B7280",
                    }}
                  >
                    Organization/Farm Name
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {user.businessName || "N/A"}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: "#6B7280",
                    }}
                  >
                    Registration Date
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {user.joinedDate || "Jan 12, 2024"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div style={{ marginBottom: "2rem" }}>
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#374151",
              }}
            >
              Documents
            </h4>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            >
              <FaFileImage size={24} color="#3B82F6" />
              <div style={{ flex: 1 }}>
                <span style={{ display: "block", fontWeight: 500 }}>
                  {getDocumentName()}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                  Image File
                </span>
              </div>
              <button
                style={{
                  color: "#1DC956",
                  background: "none",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (user.documentUrl) {
                    const viewerUrl = `/document?url=${encodeURIComponent(
                      user.documentUrl
                    )}&file=${encodeURIComponent(
                      user.documentName || "Document"
                    )}&type=${user.documentType}`;
                    window.open(viewerUrl, "_blank");
                  } else {
                    alert("Document URL not found");
                  }
                }}
              >
                View
              </button>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid #E5E7EB",
            }}
          >
            <button
              onClick={() => onReject(user)}
              style={{
                flex: 1,
                padding: "0.8rem",
                border: "1px solid #EF4444",
                color: "#EF4444",
                background: "white",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <FaBan /> Reject User
            </button>
            <button
              onClick={() => onVerify(user)}
              style={{
                flex: 1,
                padding: "0.8rem",
                border: "none",
                color: "white",
                background: "#1DC956",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <FaCheck /> Verify & Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
