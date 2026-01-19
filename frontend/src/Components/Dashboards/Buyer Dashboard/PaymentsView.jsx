import React, { useState, useEffect } from "react";
import {
  FaHistory,
  FaInfoCircle,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";
import "./Styles/PaymentsView.css";
import api from "../../../api/axiosConfig";
import Pagination from "../../Common/Pagination";

const PaymentsView = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user?._id || user?.id;

  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentOnlinePage, setCurrentOnlinePage] = useState(1);
  const [currentCodPage, setCurrentCodPage] = useState(1);
  const itemsPerPage = 8;

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/wallet/${userID}`);
      setWalletData(response.data);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userID) {
      fetchWalletData();
    }
  }, [userID]);

  if (loading) {
    return (
      <div
        className="payments-view"
        style={{ textAlign: "center", padding: "5rem" }}
      >
        Loading Payment History...
      </div>
    );
  }

  const { onlineTransactions, codTransactions } = walletData || {};

  const paginatedOnlineTxns = (onlineTransactions || []).slice(
    (currentOnlinePage - 1) * itemsPerPage,
    currentOnlinePage * itemsPerPage,
  );
  const paginatedCodTxns = (codTransactions || []).slice(
    (currentCodPage - 1) * itemsPerPage,
    currentCodPage * itemsPerPage,
  );

  return (
    <div className="payments-view">
      <div className="pv-header">
        <h1>Payment History</h1>
        <p>Track your online payments and cash on delivery records.</p>
      </div>

      {/* Online Transaction History */}
      <section className="pv-section">
        <div className="section-title">
          <FaHistory /> Recent Online Payments
        </div>
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
                    No online payments yet.
                  </td>
                </tr>
              ) : (
                paginatedOnlineTxns.map((tx) => {
                  const partner = tx.sellerId;
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
                              {partner.role || "Seller"}
                            </div>
                          </>
                        ) : (
                          <>
                            System
                            <div style={{ fontSize: "0.75rem", color: "#666" }}>
                              Adjustment
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
                          className={`status-pill ${tx.status === "Locked" ? "completed" : tx.status.toLowerCase()}`}
                        >
                          {tx.status === "Pending" && (
                            <FaClock style={{ marginRight: "4px" }} />
                          )}
                          {tx.status === "Locked" || tx.status === "Completed"
                            ? "Paid"
                            : tx.status}
                        </span>
                      </td>
                      <td className="pv-amount debit">
                        <div style={{ fontWeight: "600" }}>
                          Rs. {tx.amount.toLocaleString()}
                        </div>
                      </td>
                      <td style={{ fontStyle: "italic" }}>{tx.description}</td>
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
      </section>

      {/* COD Settlement Ledger */}
      <section className="pv-section">
        <div className="section-title ledger">
          <FaMoneyBillWave /> COD Cash Records (Paid at Delivery)
        </div>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          This is a read-only record of cash payments made during delivery.
          <FaInfoCircle
            style={{ marginLeft: "5px", verticalAlign: "middle" }}
            title="Cash payments are handled offline at the time of delivery."
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
                  const partner = tx.sellerId;
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
                              {partner.role || "Seller"}
                            </div>
                          </>
                        ) : (
                          <>
                            System
                            <div style={{ fontSize: "0.75rem", color: "#666" }}>
                              Adjustment
                            </div>
                          </>
                        )}
                      </td>
                      <td className="order-id">{tx.orderID || "N/A"}</td>
                      <td>
                        <span className="method-tag esewa">Cash Out</span>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${tx.status.toLowerCase()}`}
                        >
                          {tx.status === "Completed" ? "Settled" : "Pending"}
                        </span>
                      </td>
                      <td className="pv-amount debit">
                        <div style={{ fontWeight: "600" }}>
                          Rs. {tx.amount.toLocaleString()}
                        </div>
                      </td>
                      <td style={{ fontStyle: "italic" }}>{tx.description}</td>
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
    </div>
  );
};

export default PaymentsView;
