import React, { useState } from "react";
import {
  FaArrowLeft,
  FaLeaf,
  FaSyncAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LoginPopup = ({ toggleLoginPopup, toggleSignupPopup }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store user data and token
      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(new Event("userUpdated"));

      // Close popup
      toggleLoginPopup();

      // Redirect to role-specific dashboard
      navigate(`/${data.role}-dashboard`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <a href="#" className="forgot-password">
            Forgot password?
          </a>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Logging..." : "Login"}
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
