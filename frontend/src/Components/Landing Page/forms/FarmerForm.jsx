import React from "react";
import { FaLeaf, FaUpload, FaChevronDown, FaTimes } from "react-icons/fa";

const FarmerForm = ({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  getPaymentPlaceholder,
  filePreviews,
  handleFileChange,
  removeFile,
}) => {
  return (
    <div className="farmer-registration">
      <div className="login-logo">
        <span className="login-logo-icon">
          <FaLeaf />
        </span>
        <span className="login-logo-text">AgroMart</span>
      </div>
      <h2>Create Farmer Account</h2>

      <form className="registration-form">
        {/* Personal Information */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+1 (555) 123-4567" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="john.doe@example.com" required />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" placeholder="Lamachaur-16, GCES" required />
            </div>
          </div>
        </div>

        {/* Farm Information */}
        <div className="form-section">
          <h3>Farm Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Farm Name</label>
              <input type="text" placeholder="AgroSupply Inc." required />
            </div>
            <div className="form-group">
              <label>Farm Registration Number</label>
              <input type="text" placeholder="BRN-123456789" required />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Upload Business Documents</label>
            <label className="upload-area" htmlFor="farmer-license">
              {filePreviews.farmer ? (
                <div className="preview-container">
                  <img
                    src={filePreviews.farmer}
                    alt="Preview"
                    className="preview-image"
                  />
                  <button
                    className="remove-file-btn"
                    onClick={(e) => removeFile(e, "farmer")}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <>
                  <FaUpload className="upload-icon" />
                  <p>Click to upload your Farm license</p>
                </>
              )}
              <input
                type="file"
                id="farmer-license"
                hidden
                onChange={(e) => handleFileChange(e, "farmer")}
                accept="image/*"
              />
            </label>
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
                  placeholder={getPaymentPlaceholder(selectedPaymentMethod)}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Account Security */}
        <div className="form-section">
          <h3>Account Security</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="••••••••" required />
            </div>
          </div>
        </div>

        <button type="submit" className="register-submit-btn">
          Create Farmer Account
        </button>
      </form>
    </div>
  );
};

export default FarmerForm;
