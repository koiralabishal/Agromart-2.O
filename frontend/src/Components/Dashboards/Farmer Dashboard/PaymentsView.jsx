import React, { useState, useEffect } from "react";
import {
  FaWallet,
  FaHistory,
  FaExchangeAlt,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaTimes,
  FaMoneyBillWave,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import "./Styles/PaymentsView.css";
import api from "../../../api/axiosConfig";

const PaymentsView = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user?._id || user?.id;

  const [walletData, setWalletData] = useState(() => {
    const cached = localStorage.getItem(`cached_farmer_wallet_${userID}`);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!walletData); // Only load if no cache
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("eSewa");
  const [accountDetails, setAccountDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const fetchWalletData = async () => {
    try {
      // Background fetch: don't show loading if we have cache
      const response = await api.get(`/wallet/${userID}`);
      setWalletData(response.data);
      localStorage.setItem(
        `cached_farmer_wallet_${userID}`,
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      const response = await api.get(`/wallet/payment-details/${userID}`);
      if (response.data) {
        setWithdrawMethod(response.data.paymentMethod || "eSewa");
        setAccountDetails(response.data.gatewayId || "");
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  useEffect(() => {
    if (userID) {
      fetchWalletData();
    }
  }, [userID]);

  useEffect(() => {
    if (isWithdrawModalOpen) {
      fetchPaymentDetails();
    }
  }, [isWithdrawModalOpen]);

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || !accountDetails) return;

    if (parseFloat(withdrawAmount) > walletData?.wallet?.availableBalance) {
      alert("Insufficient available balance");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/wallet/withdraw", {
        userId: userID,
        amount: parseFloat(withdrawAmount),
        paymentMethod: withdrawMethod,
        accountDetails: accountDetails,
      });
      setIsWithdrawModalOpen(false);
      setIsSuccessModalOpen(true); // Open custom success modal
      setWithdrawAmount("");
      fetchWalletData(); // Refresh data
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="payments-view"
        style={{ textAlign: "center", padding: "5rem" }}
      >
        Loading Wallet Data...
      </div>
    );
  }

  const { wallet, onlineTransactions, codTransactions, withdrawals } = walletData || {};

  return (
    <div className="payments-view">
      <div className="pv-header">
        <h1>Payments & Earnings</h1>
        <p>Manage your online wallet and track your cash transactions.</p>
      </div>

      {/* Online Wallet Section */}
      <section className="pv-section">
        <div className="section-title">
          <FaWallet /> Online Wallet (Withdrawable Earnings)
        </div>

        <div className="pv-balance-grid">
          <div className="pv-balance-card available">
            <div className="card-label">
              Available Balance
              <FaInfoCircle
                className="info-icon"
                title="Earnings from delivered orders that you can withdraw now."
              />
            </div>
            <div className="card-amount">
              Rs. {wallet?.availableBalance?.toLocaleString() || "0"}
            </div>
            <div className="card-footer">Withdrawable immediately</div>
          </div>

          <div className="pv-balance-card locked">
            <div className="card-label">
              Locked Balance
              <FaInfoCircle
                className="info-icon"
                title="Earnings from active orders. Will be moved to Available after delivery."
              />
            </div>
            <div className="card-amount">
              Rs. {wallet?.lockedBalance?.toLocaleString() || "0"}
            </div>
            <div className="card-footer">Pending order deliveries</div>
          </div>

          <div className="pv-balance-card total">
            <div className="card-label">
              Total Online Earnings
              <FaCheckCircle
                className="info-icon"
                title="Your total earnings through online payments since joining."
              />
            </div>
            <div className="card-amount">
              Rs. {wallet?.totalEarnings?.toLocaleString() || "0"}
            </div>
            <div className="card-footer">Lifetime online income</div>
          </div>
        </div>

        <div className="pv-actions">
          <button
            className="withdraw-btn"
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={!wallet?.availableBalance || wallet.availableBalance <= 0}
          >
            <FaArrowUp /> Request Withdrawal
          </button>
        </div>

        {/* Online Transaction History */}
        <div className="pv-history" style={{ marginTop: "2rem" }}>
          <h3
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaHistory /> Recent Online Transactions
          </h3>
          <div className="pv-table-container">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order/Description</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {onlineTransactions?.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No online transactions yet.
                    </td>
                  </tr>
                ) : (
                  onlineTransactions?.map((tx) => (
                    <tr key={tx._id}>
                      <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td>
                        {tx.orderId ? (
                          <span className="order-id">
                            Order {tx.orderID_Display}
                          </span>
                        ) : (
                          tx.description
                        )}
                      </td>
                      <td>
                        <span
                          className={`method-tag ${tx.paymentMethod.toLowerCase()}`}
                        >
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${tx.status.toLowerCase()}`}
                        >
                          {tx.status === "Locked" && (
                            <FaClock style={{ marginRight: "4px" }} />
                          )}
                          {tx.status}
                        </span>
                      </td>
                      <td className={`pv-amount ${tx.type.toLowerCase()}`}>
                        {tx.type === "Credit" ? "+" : "-"} Rs.{" "}
                        {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Request History */}
        <div className="pv-history" style={{ marginTop: "3rem" }}>
          <h3
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#ef4444",
            }}
          >
            <FaExchangeAlt /> Withdrawal Request History
          </h3>
          <div className="pv-table-container">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Request Date</th>
                  <th>Method</th>
                  <th>Account Details</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals?.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No withdrawal requests yet.
                    </td>
                  </tr>
                ) : (
                  withdrawals?.map((w) => (
                    <tr key={w._id}>
                      <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`method-tag ${w.paymentMethod.toLowerCase()}`}>
                          {w.paymentMethod}
                        </span>
                      </td>
                      <td>{w.accountDetails}</td>
                      <td>
                        <span className={`status-pill ${w.status.toLowerCase()}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="pv-amount debit" style={{ color: "#ef4444" }}>
                        - Rs. {w.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* COD Settlement Ledger */}
      <section className="pv-section">
        <div className="section-title ledger">
          <FaMoneyBillWave /> COD Settlement Ledger – Cash Received
        </div>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          This is a read-only record of cash payments received directly from
          collectors/distributors.
          <FaInfoCircle
            style={{ marginLeft: "5px", verticalAlign: "middle" }}
            title="Cash received directly is not part of your online withdrawable wallet."
          />
        </p>

        <div className="pv-table-container">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Description</th>
                <th>Payment Status</th>
                <th>Amount Received</th>
              </tr>
            </thead>
            <tbody>
              {codTransactions?.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No COD records yet.
                  </td>
                </tr>
              ) : (
                codTransactions?.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="order-id">{tx.orderID_Display}</td>
                    <td>{tx.description}</td>
                    <td>
                      <span
                        className={`status-pill ${tx.status.toLowerCase()}`}
                      >
                        {tx.status === "Completed" ? "Paid (Cash)" : "Pending"}
                      </span>
                    </td>
                    <td className="pv-amount credit">
                      Rs. {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="withdraw-modal-overlay">
          <div className="withdraw-modal">
            <button
              className="modal-close"
              onClick={() => setIsWithdrawModalOpen(false)}
            >
              <FaTimes />
            </button>
            <h2>Request Withdrawal</h2>
            <form onSubmit={handleWithdrawRequest}>
              <div className="modal-form-group">
                <label>Available Balance</label>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#1dc956",
                  }}
                >
                  Rs. {wallet?.availableBalance?.toLocaleString()}
                </div>
              </div>
              <div className="modal-form-group">
                <label>Amount to Withdraw (Rs.)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                  min="100"
                  max={wallet?.availableBalance}
                />
              </div>
              <div className="modal-form-group">
                <label>Transfer Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                >
                  <option value="eSewa">eSewa</option>
                  <option value="Khalti">Khalti</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label>{withdrawMethod} Account Details</label>
                <input
                  type="text"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={
                    withdrawMethod === "Bank Transfer"
                      ? "Acc No, Bank Name, Branch"
                      : `${withdrawMethod} ID / Phone`
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="withdraw-btn"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="withdraw-modal-overlay">
          <div className="withdraw-modal success-modal">
            <div className="success-icon-container">
              <FaCheckCircle className="success-icon" />
            </div>
            <h2>Request Submitted!</h2>
            <p className="success-message-red">
              Your payment will be received within 24 hours..
            </p>
            <button
              className="modal-close-btn"
              onClick={() => setIsSuccessModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsView;
