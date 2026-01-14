import React from "react";
import { Link } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import "./Styles/PaymentSuccess.css"; // Reuse success styles for consistency

const PaymentFailure = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  // Map roles to their dashboard paths
  const dashboardPaths = {
    farmer: "/farmer-dashboard",
    collector: "/collector-dashboard",
    supplier: "/supplier-dashboard",
    buyer: "/buyer-dashboard",
    
  };

  const dashboardPath = dashboardPaths[role] || "/";

  // Since CartView is internal to dashboards, "Try Again" should ideally go back to the dashboard with Cart view active.
  // Assuming default view or user can navigate to cart easily.
  // For now, redirecting to the specific dashboard is the safest fallback for "Try Again" as well,
  // unless we pass a state to open the cart.
  
  return (
    <div className="payment-success-container failure-mode">
      <div className="payment-card failure-card">
        <div className="status-content failed">
          <FaTimesCircle className="error-icon" />
          <h2>Payment Failed</h2>
          <p>
            The payment process was canceled or failed. No order has been placed.
          </p>
          <div className="action-buttons">
            {/* Try Again acts as a Go Back to Dashboard/Cart */}
            {/* <Link to={dashboardPath} className="btn-retry">
              Try Again
            </Link> */}
            <Link to={dashboardPath} className="btn-dashboard">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
