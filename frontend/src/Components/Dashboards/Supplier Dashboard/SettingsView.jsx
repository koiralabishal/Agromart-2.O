import React, { useState, useRef } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCamera,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./Styles/SettingsView.css";

const SettingsView = () => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "Evelyn Vance",
    email: "evelyn.vance@agromart.com",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    if (selectedFile) {
      console.log("Saving photo:", selectedFile.name);
      // Future: API call to upload photo
      setSelectedFile(null);
      // Keep previewUrl as the new permanent photo
    }
  };

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>
          Manage your account settings and preferences across AgroMart services.
        </p>
      </div>

      {/* Profile Card */}
      <div className="settings-card profile-card">
        <div className="profile-header-content">
          <div className="avatar-wrapper">
            <img
              src={previewUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn"}
              alt="Profile"
              className="settings-avatar"
            />
            <span className="status-dot online"></span>
          </div>
          <div className="profile-info-text">
            <h2>{profileData.name}</h2>
            <p className="profile-email-sub">{profileData.email}</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="profile-btns-container">
            <button className="change-photo-btn" onClick={handlePhotoClick}>
              Change Photo
            </button>
            {selectedFile && (
              <button className="save-photo-btn" onClick={handleSavePhoto}>
                Save Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Profile Information</h3>
          <p>Update your personal details and contact information.</p>
        </div>
        <div className="form-grid">
          <div className="input-group">
            <label>Name</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Enter your name"
              />
            </div>
            <p className="input-hint">This name will appear on your profile.</p>
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
              />
            </div>
            <p className="input-hint">
              We'll send important notifications to this address.
            </p>
          </div>
        </div>
        <div className="card-footer">
          <button className="save-btn">Save Changes</button>
        </div>
      </div>

      {/* Security & Access Section */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Security & Access</h3>
          <p>Change your password and manage account security.</p>
        </div>
        <div className="form-column">
          <div className="input-group">
            <label>Current Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
            </div>
            <p className="input-hint">Required to verify your identity.</p>
          </div>
          <div className="input-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />
            </div>
            <p className="input-hint">Must be at least 8 characters long.</p>
          </div>
          <div className="input-group">
            <label>Confirm New Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
            </div>
            <p className="input-hint">Re-enter your new password to confirm.</p>
          </div>
        </div>
        <div className="card-footer">
          <button className="save-btn secondary">Update Password</button>
        </div>
      </div>

      {/* Account Management Section */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Account Management</h3>
          <p>
            Permanently manage your AgroMart account and all associated data.
          </p>
        </div>
        <div className="account-mgmt-content">
          <p className="warning-text">
            Permanently delete your AgroMart account and all associated data.
            <span className="bold red-text"> This action is irreversible.</span>
          </p>
          <button className="delete-btn">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
