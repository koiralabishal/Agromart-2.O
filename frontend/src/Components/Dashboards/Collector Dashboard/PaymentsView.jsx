import React, { useState, useEffect } from "react";
import {
  FaWallet,
  FaHistory,
  FaInfoCircle,
  FaArrowUp,
  FaCheckCircle,
  FaTimes,
  FaMoneyBillWave,
  FaClock,
  FaExchangeAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import "./Styles/PaymentsView.css";
import api from "../../../api/axiosConfig";
import Pagination from "../../Common/Pagination";
import DisputeModal from "../../Common/DisputeModal";
import { toast } from "react-toastify";

const PaymentsView = ({ walletDataProp }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user?._id || user?.id;

  const [walletData, setWalletData] = useState(() => {
    if (walletDataProp) return walletDataProp;
    try {
      const cached = localStorage.getItem(`cached_collector_wallet_${userID}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.error("Cache parse error:", e);
      return null;
    }
  });
  // Zero-Loading: Never show blocking loading
  const [loading, setLoading] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("eSewa");
  const [accountDetails, setAccountDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentOnlinePage, setCurrentOnlinePage] = useState(1);
  const [currentWithdrawalPage, setCurrentWithdrawalPage] = useState(1);
  const [currentCodPage, setCurrentCodPage] = useState(1);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isDisputeLoading, setIsDisputeLoading] = useState(false);
  const [disputeTarget, setDisputeTarget] = useState(null);
  const itemsPerPage = 10;

  const fetchWalletData = async () => {
    try {
      const response = await api.get(`/wallet/${userID}?v=${Date.now()}`);
      setWalletData(response.data);
      localStorage.setItem(
        `cached_collector_wallet_${userID}`,
        JSON.stringify(response.data),
      );
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentDetails = async () => {
    if (!userID) return;
    try {
      const response = await api.get(
        `/wallet/payment-details/${userID}?v=${Date.now()}`,
      );
      if (response.data) {
        setWithdrawMethod(response.data.paymentMethod || "eSewa");
        setAccountDetails(response.data.gatewayId || "");
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  // Sync internal state when props change
  useEffect(() => {
    if (walletDataProp) {
      setWalletData(walletDataProp);
      localStorage.setItem(`cached_collector_wallet_${userID}`, JSON.stringify(walletDataProp));
      setLoading(false);
    }
  }, [walletDataProp, userID]);

  useEffect(() => {
    if (userID && !walletDataProp) {
      fetchWalletData();
    }
  }, [userID, walletDataProp]);

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

  const handleDisputeConfirm = async (disputeData) => {
    try {
      setIsDisputeLoading(true);
      const formData = new FormData();
      
      Object.keys(disputeData).forEach(key => {
        if (key === 'evidenceDocuments') {
          disputeData[key].forEach(file => {
            formData.append('evidenceDocuments', file);
          });
        } else {
          formData.append(key, disputeData[key] || "");
        }
      });

      if (disputeTarget) {
        Object.keys(disputeTarget).forEach(key => {
          if (disputeTarget[key] && !formData.has(key)) {
            formData.append(key, disputeTarget[key]);
          }
        });
      }
      
      await api.post("/disputes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Dispute raised successfully! Admin will review it.");
      setIsDisputeModalOpen(false);
    } catch (error) {
      console.error("Error raising dispute:", error);
      toast.error(error.response?.data?.message || "Failed to raise dispute");
    } finally {
      setIsDisputeLoading(false);
    }
  };

  const openDisputeModal = (target) => {
    setDisputeTarget(target);
    setIsDisputeModalOpen(true);
  };

  // Zero-Loading: No blocking loading indicator

  const { wallet, onlineTransactions, codTransactions, withdrawals } =
    walletData || {};

  const paginatedOnlineTxns = (onlineTransactions || []).slice(
    (currentOnlinePage - 1) * itemsPerPage,
    currentOnlinePage * itemsPerPage,
  );
  const paginatedWithdrawals = (withdrawals || []).slice(
    (currentWithdrawalPage - 1) * itemsPerPage,
    currentWithdrawalPage * itemsPerPage,
  );
  const paginatedCodTxns = (codTransactions || []).slice(
    (currentCodPage - 1) * itemsPerPage,
    currentCodPage * itemsPerPage,
  );

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
          {wallet?.isFrozen === "yes" ? (
            <div className="frozen-warning">
              <FaInfoCircle /> Your wallet is currently frozen by the
              administrator. Withdrawals are temporarily disabled.
            </div>
          ) : (
            <button
              className="withdraw-btn"
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={
                !wallet?.availableBalance || wallet.availableBalance <= 0
              }
            >
              <FaArrowUp /> Request Withdrawal
            </button>
          )}
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
                  <th>Partner</th>
                  <th>Order ID</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {onlineTransactions?.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No online transactions yet.
                    </td>
                  </tr>
                ) : (
                  paginatedOnlineTxns.map((tx) => {
                    const isReceived =
                      tx.sellerId?._id === userID || tx.sellerId === userID;
                    const partner = isReceived ? tx.buyerId : tx.sellerId;
                    return (
                      <tr key={tx._id}>
                        <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td>
                          {partner ? (
                            <>
                              {partner.name || "Unknown"}
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#666",
                                  textTransform: "capitalize",
                                }}
                              >
                                {partner.role ||
                                  (isReceived ? "Buyer" : "Seller")}
                              </div>
                            </>
                          ) : (
                            <>
                              {tx.type === "Debit" &&
                              tx.description?.toLowerCase().includes("withdraw")
                                ? "Platform (Withdrawal)"
                                : "System"}
                              <div
                                style={{ fontSize: "0.75rem", color: "#666" }}
                              >
                                {tx.type === "Debit" ? "Payout" : "Adjustment"}
                              </div>
                            </>
                          )}
                        </td>
                        <td>
                          <span className="order-id">
                            {tx.orderID ||
                              (tx.orderId ? tx.orderId.orderID : "N/A")}
                          </span>
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
                            className={`status-pill ${
                              tx.status === "Locked"
                                ? isReceived
                                  ? "locked"
                                  : "completed"
                                : tx.status.toLowerCase()
                            }`}
                          >
                            {((tx.status === "Locked" && isReceived) ||
                              tx.status === "Pending") && (
                              <FaClock style={{ marginRight: "4px" }} />
                            )}
                            {tx.status === "Locked"
                              ? isReceived
                                ? "Locked"
                                : "Paid"
                              : tx.status === "Completed"
                                ? isReceived
                                  ? "Received"
                                  : "Paid"
                                : tx.status}
                          </span>
                        </td>
                        <td
                          className={`pv-amount ${isReceived ? "credit" : "debit"}`}
                        >
                          <div style={{ fontWeight: "600" }}>
                            Rs. {tx.amount.toLocaleString()}
                          </div>
                        </td>
                        <td style={{ fontStyle: "italic" }}>
                          {tx.description}
                        </td>
                        <td>
                          <button 
                            className="pv-dispute-btn"
                            onClick={() => openDisputeModal({ 
                              transactionUUID: tx.transactionUUID,
                              sellerID: isReceived ? tx.buyerId?._id : tx.sellerId?._id,
                              orderID: tx.orderID || (tx.orderId ? tx.orderId.orderID : null)
                            })}
                            title="Report issue with this transaction"
                          >
                            <FaExclamationCircle />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {onlineTransactions?.length > itemsPerPage && (
              <Pagination
                currentPage={currentOnlinePage}
                totalItems={onlineTransactions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentOnlinePage(page)}
              />
            )}
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
                  <th>Remarks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {withdrawals?.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No withdrawal requests yet.
                    </td>
                  </tr>
                ) : (
                  paginatedWithdrawals.map((w) => (
                    <tr key={w._id}>
                      <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`method-tag ${w.paymentMethod.toLowerCase()}`}
                        >
                          {w.paymentMethod}
                        </span>
                      </td>
                      <td>{w.accountDetails}</td>
                      <td>
                        <span
                          className={`status-pill ${w.status.toLowerCase()}`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td
                        className="pv-amount debit"
                        style={{ color: "#ef4444" }}
                      >
                        Rs. {w.amount.toLocaleString()}
                      </td>
                      <td className="remarks-cell">
                        {w.remarks ||
                          (w.status === "Pending"
                            ? "Withdrawal Requested"
                            : "-")}
                      </td>
                      <td>
                        <button 
                          className="pv-dispute-btn"
                          onClick={() => openDisputeModal({ 
                            withdrawalID: w.withdrawalID,
                            orderID: null
                          })}
                          title="Report issue with this withdrawal"
                        >
                          <FaExclamationCircle />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {withdrawals?.length > itemsPerPage && (
              <Pagination
                currentPage={currentWithdrawalPage}
                totalItems={withdrawals.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentWithdrawalPage(page)}
              />
            )}
          </div>
        </div>
      </section>

      {/* COD Settlement Ledger */}
      <section className="pv-section">
        <div className="section-title ledger">
          <FaMoneyBillWave /> COD Settlement Ledger – Cash Records
        </div>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          This is a read-only record of cash transactions (Received as Seller /
          Paid as Buyer).
          <FaInfoCircle
            style={{ marginLeft: "5px", verticalAlign: "middle" }}
            title="Cash transactions are handled offline and are not part of your online wallet balance."
          />
        </p>

        <div className="pv-table-container">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Partner</th>
                <th>Order ID</th>
                <th>Cash Flow</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {codTransactions?.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No COD records yet.
                  </td>
                </tr>
              ) : (
                paginatedCodTxns.map((tx) => {
                  const isReceived =
                    tx.sellerId === userID || tx.sellerId?._id === userID;
                  const partner = isReceived ? tx.buyerId : tx.sellerId;
                  return (
                    <tr key={tx._id}>
                      <td>
                        {tx.status === "Completed"
                          ? new Date(tx.updatedAt).toLocaleDateString()
                          : new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {partner ? (
                          <>
                            {partner.name || "Unknown"}
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#666",
                                textTransform: "capitalize",
                              }}
                            >
                              {partner.role ||
                                (isReceived ? "Buyer" : "Seller")}
                            </div>
                          </>
                        ) : (
                          <>
                            System
                            <div style={{ fontSize: "0.75rem", color: "#666" }}>
                              Record
                            </div>
                          </>
                        )}
                      </td>
                      <td className="order-id">{tx.orderID || "N/A"}</td>
                      <td>
                        <span
                          className={`method-tag ${isReceived ? "khalti" : "esewa"}`}
                        >
                          {isReceived ? "Cash In" : "Cash Out"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${tx.status.toLowerCase()}`}
                        >
                          {tx.status === "Completed" ? "Settled" : "Pending"}
                        </span>
                      </td>
                      <td
                        className={`pv-amount ${isReceived ? "credit" : "debit"}`}
                      >
                        Rs. {tx.amount.toLocaleString()}
                      </td>
                      <td style={{ fontStyle: "italic" }}>{tx.description}</td>
                      <td>
                        <button 
                          className="pv-dispute-btn"
                          onClick={() => openDisputeModal({ 
                            transactionUUID: tx.transactionUUID,
                            sellerID: isReceived ? tx.buyerId?._id : tx.sellerId?._id,
                            orderID: tx.orderID
                          })}
                          title="Report issue with this record"
                        >
                          <FaExclamationCircle />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {codTransactions?.length > itemsPerPage && (
            <Pagination
              currentPage={currentCodPage}
              totalItems={codTransactions.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentCodPage(page)}
            />
          )}
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
      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onConfirm={handleDisputeConfirm}
        isLoading={isDisputeLoading}
        orderID={disputeTarget?.orderID}
      />
    </div>
  );
};

export default PaymentsView;
