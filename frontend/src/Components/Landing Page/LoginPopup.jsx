import React from "react";
import { FaArrowLeft, FaLeaf } from "react-icons/fa";

const LoginPopup = ({ toggleLoginPopup, toggleSignupPopup }) => {
  return (
    <div className="login-overlay">
      <div className="login-card">
        <button className="back-btn" onClick={toggleLoginPopup}>
          <FaArrowLeft />
        </button>
        <div className="login-logo">
          <span className="login-logo-icon">
            <FaLeaf />
          </span>
          <span className="login-logo-text">AgroMart</span>
        </div>
        <h2>Welcome to AgroMart</h2>
        <p className="login-subtitle">
          Log in to your secure, AI powered agricultural marketplace.
        </p>

        <form className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" required />
          </div>
          <a href="#" className="forgot-password">
            Forgot password?
          </a>
          <button type="submit" className="login-submit-btn">
            Login
          </button>
          <button
            type="button"
            className="login-signup-btn"
            onClick={() => {
              toggleLoginPopup();
              toggleSignupPopup();
            }}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;
