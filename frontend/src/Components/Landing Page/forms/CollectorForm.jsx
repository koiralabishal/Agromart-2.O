import React, { useState } from "react";
import { FaLeaf, FaUpload, FaChevronDown, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import OTPPopup from "../OTPPopup";
import SuccessPopup from "../SuccessPopup";

const CollectorForm = ({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  getPaymentPlaceholder,
  filePreviews,
  handleFileChange,
  removeFile,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    location: "",
    phone: "",
    email: "",
    gatewayId: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send OTP");
      }

      setShowOTP(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (otp) => {
    setLoading(true);
    setOtpError("");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      data.append("role", "collector");
      data.append("address", formData.location);
      data.append("paymentMethod", selectedPaymentMethod);
      data.append("otp", otp);

      const fileInput = document.getElementById("collector-license");
      if (fileInput.files[0]) {
        data.append("license", fileInput.files[0]);
      }

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      setSuccess(true);
      setShowOTP(false);
      localStorage.setItem("user", JSON.stringify(result));
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
    } catch (err) {
      setOtpError("Failed to resend OTP");
    }
  };

  if (success) {
    return (
      <SuccessPopup 
        name={formData.name} 
        role="collector" 
        onClose={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="farmer-registration">
      {" "}
      {/* Reusing class for consistency */}
      <div className="login-logo">
        <span className="login-logo-icon">
          <FaLeaf />
        </span>
        <span className="login-logo-text">AgroMart</span>
      </div>
      <h2>Create Collector Account</h2>
      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name"
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Company/Collector Name</label>
              <input 
                type="text" 
                name="companyName" 
                placeholder="Harvest Haulers Co." 
                value={formData.companyName}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          <div
            className="form-group full-width"
            style={{ marginTop: "1.5rem" }}
          >
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g., Greater Agroland Region, Specific Districts"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-grid" style={{ marginTop: "1.5rem" }}>
            <div className="form-group">
              <label>Phone</label>
              <input 
                type="tel" 
                name="phone"
                placeholder="+1 (555) 123-4567" 
                value={formData.phone}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="john.doe@harvesthaulers.com"
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
                  placeholder="••••••••" 
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
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword"
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="form-section">
          <h3>Payment Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Payment Method</label>
              <div className="select-wrapper">
                <select
                  required
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <option value="">Select Gateway</option>
                  <option value="esewa">Esewa</option>
                  <option value="khalti">Khalti Pay</option>
                  <option value="bank">Bank Transfer</option>
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>
            {selectedPaymentMethod && (
              <div className="form-group">
                <label>Gateway Details</label>
                <input
                  type="text"
                  name="gatewayId"
                  placeholder={getPaymentPlaceholder(selectedPaymentMethod)}
                  value={formData.gatewayId}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Upload License */}
        <div className="form-section">
          <h3>Upload License</h3>
          <div className="form-group full-width">
            <label className="upload-area" htmlFor="collector-license">
              {filePreviews.collector ? (
                <div className="preview-container">
                  <img
                    src={filePreviews.collector}
                    alt="Preview"
                    className="preview-image"
                  />
                  <button
                    className="remove-file-btn"
                    onClick={(e) => removeFile(e, "collector")}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <>
                  <FaUpload className="upload-icon" />
                  <p>Click to upload your collector license</p>
                </>
              )}
              <input
                type="file"
                id="collector-license"
                hidden
                onChange={(e) => handleFileChange(e, "collector")}
                accept="image/*"
                required
              />
            </label>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="register-submit-btn" disabled={loading}>
          {loading ? "Processing..." : "Create Collector Account"}
        </button>
      </form>

      {showOTP && (
        <OTPPopup 
          email={formData.email}
          onVerify={handleVerifyAndRegister}
          onClose={() => setShowOTP(false)}
          onResend={handleResendOTP}
          loading={loading}
          error={otpError}
        />
      )}
    </div>
  );
};

export default CollectorForm;
