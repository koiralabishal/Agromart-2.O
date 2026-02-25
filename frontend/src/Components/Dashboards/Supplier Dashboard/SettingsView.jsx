import React, { useState, useRef, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCamera,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosConfig";
import ConfirmationModal from "../../Common/ConfirmationModal";
import "./Styles/SettingsView.css";

const SettingsView = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  // Get initially logged in user from localStorage
  const initialUser = JSON.parse(localStorage.getItem("user")) || {};
  
  const [previewUrl, setPreviewUrl] = useState(initialUser.profileImage || null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Get logged in user from state for reactivity
  const [currentUser, setCurrentUser] = useState(initialUser);
  const userID = currentUser._id || currentUser.id;

  const [profileData, setProfileData] = useState({
    name: currentUser.name || "",
    email: currentUser.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Zero-Loading Feel: If we have cached data, don't show the full page spinner
  const [isFetching, setIsFetching] = useState(!currentUser.email);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Background Sync: Fetch latest profile from backend to keep content fresh
    const syncProfile = async () => {
      if (!userID || userID === 'admin-id') {
        setIsFetching(false);
        return;
      }
      try {
        const response = await api.get(`/users/profile/${userID}`);
        const updatedUser = { ...currentUser, ...response.data };
        
        // Only update if data has actually changed to avoid unnecessary re-renders
        if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }
      } catch (err) {
        console.error("Background sync failed", err);
      } finally {
        setIsFetching(false);
      }
    };
    syncProfile();
  }, [userID]);

  useEffect(() => {
    // When currentUser state updates, sync the profile data
    setProfileData({
      name: currentUser.name || "",
      email: currentUser.email || "",
    });
  }, [currentUser]);

  useEffect(() => {
    if (currentUser.profileImage && !selectedFile) {
      setPreviewUrl(currentUser.profileImage);
    }
  }, [currentUser.profileImage, selectedFile]);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePassword = (password) => {
    // Requires at least one letter and one number, minimum 8 characters, allows special characters
    return /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

  const handleSavePhoto = async () => {
    if (!selectedFile) return;

    setLoadingPhoto(true);
    const formData = new FormData();
    formData.append("userID", userID);
    formData.append("profileImage", selectedFile);

    try {
      const response = await api.put("/users/profile", formData);
      
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      window.dispatchEvent(new Event('userUpdated'));
      setSuccessMsg("Profile photo updated successfully!");
      setSelectedFile(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error updating photo:", err);
      if (err.response) {
        console.log("Server responded with:", err.response.status, err.response.data);
      }
      setErrors({ photo: err.response?.data?.message || "Server error: Failed to upload photo" });
    } finally {
      setLoadingPhoto(false);
    }
  };

  const handleUpdateProfile = async () => {
    const newErrors = {};
    if (!profileData.name.trim()) newErrors.name = "Name is required";
    if (!profileData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(profileData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoadingProfile(true);
    try {
      const response = await api.put("/users/profile", {
        userID,
        name: profileData.name,
        email: profileData.email,
      });

      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      window.dispatchEvent(new Event('userUpdated'));
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrors({ profile: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = "Current password is required";
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!validatePassword(passwordData.newPassword)) {
      newErrors.newPassword = "Password must be 8+ chars with letters and numbers";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoadingPassword(true);
    try {
      await api.put("/users/profile", {
        userID,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccessMsg("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrors({ 
        currentPassword: err.response?.status === 401 
          ? "Invalid current password" 
          : (err.response?.data?.message || "Failed to update password") 
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteModalOpen(false);
    setLoadingDelete(true);
    try {
      await api.delete("/users/profile");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("userUpdated"));
      navigate("/");
    } catch (err) {
      console.error("Delete account error:", err);
      setErrors({
        delete:
          err.response?.data?.message ||
          "Failed to delete account. Please try again.",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  const isProfileChanged = profileData.name.trim() !== (currentUser.name || "").trim() || 
                             profileData.email.trim() !== (currentUser.email || "").trim();
  
  const isPasswordChanged = passwordData.currentPassword.length > 0 && 
                             passwordData.newPassword.length >= 8 && 
                             passwordData.newPassword === passwordData.confirmPassword &&
                             passwordData.currentPassword !== passwordData.newPassword;

  if (isFetching) {
    return (
      <div className="settings-loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>
          Manage your account settings and preferences across AgroMart services.
        </p>
      </div>

      {successMsg && (
        <div className="settings-success-popup">
          <FaCheckCircle /> {successMsg}
        </div>
      )}

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
              <button 
                className="save-photo-btn" 
                onClick={handleSavePhoto}
                disabled={loadingPhoto}
              >
                {loadingPhoto ? "Saving..." : "Save Photo"}
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
            <div className={`input-wrapper ${errors.name ? "has-error" : ""}`}>
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Enter your name"
              />
            </div>
            {errors.name && <p className="error-text-inline">{errors.name}</p>}
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <div className={`input-wrapper ${errors.email ? "has-error" : ""}`}>
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="error-text-inline">{errors.email}</p>}
          </div>
        </div>
        <div className="card-footer">
          <button 
            className={`save-btn ${!isProfileChanged ? "disabled" : ""}`} 
            onClick={handleUpdateProfile} 
            disabled={loadingProfile || !isProfileChanged}
          >
            {loadingProfile ? "Updating..." : "Save Changes"}
          </button>
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
            <div className={`input-wrapper ${errors.currentPassword ? "has-error" : ""}`}>
              <FaLock className="input-icon" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                autoComplete="off"
              />
              <button 
                type="button" 
                className="password-toggle-btn" 
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.currentPassword ? (
              <p className="error-text-inline">{errors.currentPassword}</p>
            ) : (
              <p className="input-hint">Required to verify your identity.</p>
            )}
          </div>
          <div className="input-group">
            <label>New Password</label>
            <div className={`input-wrapper ${errors.newPassword ? "has-error" : ""}`}>
              <FaLock className="input-icon" />
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className="password-toggle-btn" 
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.newPassword ? (
              <p className="error-text-inline">{errors.newPassword}</p>
            ) : (
              <p className="input-hint">Must be at least 8 characters long and include letters and numbers.</p>
            )}
          </div>
          <div className="input-group">
            <label>Confirm New Password</label>
            <div className={`input-wrapper ${errors.confirmPassword ? "has-error" : ""}`}>
              <FaLock className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
              <button 
                type="button" 
                className="password-toggle-btn" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-text-inline">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
        <div className="card-footer">
          <button 
            className={`save-btn secondary ${!isPasswordChanged ? "disabled" : ""}`} 
            onClick={handleUpdatePassword}
            disabled={loadingPassword || !isPasswordChanged}
          >
            {loadingPassword ? "Updating..." : "Update Password"}
          </button>
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
          <button 
            className="delete-btn" 
            onClick={handleDeleteAccount}
            disabled={loadingDelete}
          >
            {loadingDelete ? "Deleting..." : "Delete Account"}
          </button>
          {errors.delete && <p className="error-text-inline" style={{ marginTop: '10px' }}>{errors.delete}</p>}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        type="danger"
        confirmBtnText="Yes, Delete My Account"
      />
    </div>
  );
};

export default SettingsView;
