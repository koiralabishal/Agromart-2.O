import React from "react";
import { FaLeaf, FaChevronDown } from "react-icons/fa";

const BuyerForm = ({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  getPaymentPlaceholder,
}) => {
  return (
    <div className="farmer-registration">
      <div className="login-logo">
        <span className="login-logo-icon">
          <FaLeaf />
        </span>
        <span className="login-logo-text">AgroMart</span>
      </div>
      <h2>Create Buyer Registration</h2>

      <form className="registration-form">
        {/* Basic Details */}
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Company/Buyer Name (Optional)</label>
              <input type="text" placeholder="AgroSupply Co." />
            </div>
          </div>
          <div
            className="form-group full-width"
            style={{ marginTop: "1.5rem" }}
          >
            <label>Delivery Address</label>
            <input
              type="text"
              placeholder="123 Green Valley Rd, Farmville"
              required
            />
          </div>
          <div className="form-grid" style={{ marginTop: "1.5rem" }}>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" placeholder="555-123-4567" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="john.doe@example.com" required />
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

        <button type="submit" className="register-submit-btn">
          Create Buyer Account
        </button>
      </form>
    </div>
  );
};

export default BuyerForm;
