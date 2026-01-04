import React from "react";
import { FaLeaf, FaUpload, FaChevronDown, FaTimes } from "react-icons/fa";

const CollectorForm = ({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  getPaymentPlaceholder,
  filePreviews,
  handleFileChange,
  removeFile,
}) => {
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
      <form className="registration-form">
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Company/Collector Name</label>
              <input type="text" placeholder="Harvest Haulers Co." required />
            </div>
          </div>
          <div
            className="form-group full-width"
            style={{ marginTop: "1.5rem" }}
          >
            <label>Location</label>
            <input
              type="text"
              placeholder="e.g., Greater Agroland Region, Specific Districts"
              required
            />
          </div>
          <div className="form-grid" style={{ marginTop: "1.5rem" }}>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" placeholder="+1 (555) 123-4567" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="john.doe@harvesthaulers.com"
                required
              />
            </div>
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
              />
            </label>
          </div>
        </div>

        <button type="submit" className="register-submit-btn">
          Create Collector Account
        </button>
      </form>
    </div>
  );
};

export default CollectorForm;
