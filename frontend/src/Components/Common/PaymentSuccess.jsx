import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { FaCheckCircle, FaSpinner, FaTimesCircle, FaStore, FaBox } from "react-icons/fa";
import api from "../../api/axiosConfig";
import "./Styles/PaymentSuccess.css";

const PaymentSuccess = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  // Map roles to their dashboard paths
  const dashboardPaths = {
    farmer: "/farmer-dashboard",
    collector: "/collector-dashboard",
    supplier: "/supplier-dashboard",
    buyer: "/buyer-dashboard",
  };

  const dashboardPath = dashboardPaths[role] || "/dashboard";

  const location = useLocation();
  const [status, setStatus] = useState("verifying");
  const [orderDetails, setOrderDetails] = useState(null);
  const verificationAttempted = React.useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      // Prevent multiple calls
      if (verificationAttempted.current) {
        console.log("Payment verification already in progress or completed");
        return;
      }

      const queryParams = new URLSearchParams(location.search);
      const data = queryParams.get("data");

      if (!data) {
        setStatus("failed");
        return;
      }

      // Mark as attempted before making the call
      verificationAttempted.current = true;

      try {
        // Retrieve cart and user info
        const savedCart = sessionStorage.getItem("cartItems");
        const cartItems = savedCart ? JSON.parse(savedCart) : [];
        const user = JSON.parse(localStorage.getItem("user"));
        const userID = user?._id || user?.id;

        if (cartItems.length === 0) {
          console.warn("No cart items found to finalize order.");
        }

        // Call backend to verify and finalize order
        const response = await api.post("/orders/verify-payment", {
          cartItems,
          encodedData: data,
          userID,
        });

        setStatus("success");
        setOrderDetails(response.data);

        // Clear cart on success
        sessionStorage.removeItem("cartItems");
        sessionStorage.removeItem("hasViewedCart");
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus("failed");
        // Reset flag on error to allow retry
        verificationAttempted.current = false;
      }
    };

    verifyPayment();
  }, [location.search]); // Changed dependency to location.search instead of location

  // Calculate grand total from all orders
  const calculateGrandTotal = () => {
    if (!orderDetails?.orders) return 0;
    return orderDetails.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  return (
    <div className={`payment-success-container ${status === "success" ? "success-mode" : ""}`}>
      <div className={`payment-card ${status === "success" ? "success-card" : ""}`}>
        {status === "verifying" && (
          <div className="status-content">
            <FaSpinner className="spinner-icon" />
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your transaction.</p>
          </div>
        )}

        {status === "success" && (
          <div className="status-content success">
            <div className="success-icon-wrapper">
              <FaCheckCircle className="check-icon" />
            </div>
            <h2>Payment Successful!</h2>
            <p className="sub-heading">Transaction & Order Placement Successful</p>
            
            {orderDetails && (
              <div className="transaction-details">
                {/* Transaction Info */}
                <div className="detail-row">
                  <span className="label">Transaction Code:</span>
                  <span className="value">{orderDetails.transaction_code}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Transaction UUID:</span>
                  <span className="value transaction-uuid">{orderDetails.transaction_uuid}</span>
                </div>
                
                <div className="divider"></div>
                
                {/* Orders Grouped by Seller */}
                <h3><FaBox className="section-icon" /> Order Summary</h3>
                <div className="orders-list">
                  {orderDetails.orders && orderDetails.orders.map((order, index) => (
                    <div key={index} className="order-card">
                      {/* Seller Header */}
                      <div className="seller-header">
                        <div className="seller-info">
                          <FaStore className="seller-icon" />
                          <div>
                            <div className="seller-name">{order.sellerDetails?.businessName || order.sellerDetails?.name || "Unknown Seller"}</div>
                            <div className="seller-role">{order.sellerDetails?.role || "seller"}</div>
                          </div>
                        </div>
                        <div className="order-id-badge">{order.orderID}</div>
                      </div>

                      {/* Products List */}
                      <div className="products-section">
                        <table className="products-table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Qty</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.products.map((product, pIndex) => (
                              <tr key={pIndex}>
                                <td className="product-name">
                                  {product.productName}
                                  <span className="product-unit">{product.unit}</span>
                                </td>
                                <td className="product-qty">×{product.quantity}</td>
                                <td className="product-price">Rs. {product.price.toFixed(2)}</td>
                                <td className="product-total">Rs. {(product.price * product.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Order Total */}
                      <div className="order-footer">
                        <div className="order-footer-breakdown">
                          <div className="order-subtotal-row">
                            <span>Subtotal:</span>
                            <span>Rs. {(order.totalAmount - (order.deliveryCharge || 100)).toFixed(2)}</span>
                          </div>
                          <div className="order-subtotal-row">
                            <span>Delivery Charge:</span>
                            <span>Rs. {(order.deliveryCharge || 100).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="order-total-row">
                          <span className="order-total-label">Order Total:</span>
                          <span className="order-total-amount">Rs. {order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grand Total */}
                <div className="grand-total-section">
                  <div className="grand-total-row">
                    <span className="grand-total-label">Grand Total Paid:</span>
                    <span className="grand-total-amount">Rs. {calculateGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="action-buttons">
              <Link to={dashboardPath} className="btn-dashboard">
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="status-content failed">
            <FaTimesCircle className="error-icon" />
            <h2>Payment Verification Failed</h2>
            <p>
              We couldn't verify your payment. Please contact support if you
              were charged.
            </p>
            <div className="action-buttons">
              <Link to="/cart" className="btn-retry">
                Try Again
              </Link>
              <Link to={dashboardPath} className="btn-dashboard">
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
