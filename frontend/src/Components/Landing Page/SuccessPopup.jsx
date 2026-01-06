import React from "react";
import {
  FaCheckCircle,
  FaArrowRight,
  FaTrophy,
  FaAward,
  FaUserCheck,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SuccessPopup = ({ name, role, onClose }) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    const dashboardPath = `/${role}-dashboard`;
    navigate(dashboardPath);
  };

  return (
    <div className="otp-overlay success-overlay-blur">
      <div className="success-premium-card">
        {/* Animated Background Confetti */}
        <div className="confetti-container">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`confetti piece-${i}`}></div>
          ))}
        </div>

        <div className="success-hero-section">
          <div className="success-glow"></div>
          <div className="premium-icon-box">
            <FaCheckCircle className="premium-check-icon" />
          </div>
          <div className="congrats-floating-badge">
            <FaAward /> Verified Member
          </div>
        </div>

        <div className="success-content-wrapper">
          <header className="premium-success-header">
            <h2 className="reveal-text">Registration Complete!</h2>
            <div className="welcome-hero-text">
              <span className="greeting">Welcome aboard,</span>
              <h1 className="user-name-title">{name}</h1>
            </div>
          </header>

          <div className="success-info-grid">
            <div className="info-item">
              <span className="info-label">Access Level</span>
              <div className="info-value">
                <FaUserCheck className="role-icon-small" />
                {role.charAt(0).toUpperCase() + role.slice(1)} Portal
              </div>
            </div>
            <div className="info-item">
              <span className="info-label">Account Status</span>
              <div className="info-value status-active">Fully Activated</div>
            </div>
          </div>

          <p className="premium-success-p">
            Your Agromart profile is now live. We've tailored your dashboard
            with all the tools you need to grow your business.
          </p>

          <div className="success-action-area">
            <button
              className="premium-dashboard-btn"
              onClick={handleGoToDashboard}
            >
              <span>Enter Portal</span>
              <FaArrowRight className="btn-arrow-icon" />
            </button>
            <button className="premium-secondary-btn" onClick={onClose}>
              Dismiss
            </button>
          </div>
        </div>

        <footer className="premium-success-footer">
          <FaTrophy className="footer-trophy" />
          <span>Award Winning Agricultural Marketplace</span>
        </footer>
      </div>
    </div>
  );
};

export default SuccessPopup;
