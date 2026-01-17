import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";
import { FaArrowLeft } from "react-icons/fa";
import ConfirmationModal from "../../Common/ConfirmationModal";
import ReasonModal from "../../Common/ReasonModal";

const AdminWalletView = ({ walletsCache, codCache, withdrawalsCache, onCacheUpdate }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("status");
  const [wallets, setWallets] = useState(walletsCache || []);
  const [codTxns, setCodTxns] = useState(codCache || []);
  const [withdrawals, setWithdrawals] = useState(withdrawalsCache || []);
  const [loading, setLoading] = useState(!walletsCache || !codCache || !withdrawalsCache);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "info",
    confirmBtnText: "",
  });
  const [reasonModal, setReasonModal] = useState({
    isOpen: false,
    id: null,
    status: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!walletsCache || !codCache || !withdrawalsCache) setLoading(true);
    try {
      const [wRes, cRes, wdRes] = await Promise.all([
        api.get("/admin/wallets"),
        api.get("/admin/cod-ledger"),
        api.get("/admin/withdrawals")
      ]);
      setWallets(wRes.data);
      setCodTxns(cRes.data);
      setWithdrawals(wdRes.data);
      onCacheUpdate({
        wallets: wRes.data,
        codLedger: cRes.data,
        withdrawals: wdRes.data
      });
    } catch (err) {
      console.error("Failed to fetch wallet data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallets = async () => {
     try {
       const res = await api.get("/admin/wallets");
       setWallets(res.data);
       onCacheUpdate({ wallets: res.data });
       return res.data;
     } catch (err) {
       console.error("Failed to fetch wallets", err);
     }
  };

  const fetchCOD = async () => {
    try {
      const res = await api.get("/admin/cod-ledger");
      setCodTxns(res.data);
      onCacheUpdate({ codLedger: res.data });
    } catch (err) {
      console.error("Failed to fetch COD ledger", err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get("/admin/withdrawals");
      setWithdrawals(res.data);
      onCacheUpdate({ withdrawals: res.data });
    } catch (err) {
      console.error("Failed to fetch withdrawals", err);
    }
  };

  const toggleFreeze = (walletId, currentStatus) => {
    const isFreezing = currentStatus === "no";
    setConfirmModal({
      isOpen: true,
      title: isFreezing ? "Freeze Account?" : "Set Account Active?",
      message: isFreezing
        ? "This will prevent the user from performing any wallet transactions until unfrozen."
        : "This will restore the user's ability to perform wallet transactions.",
      confirmBtnText: isFreezing ? "Yes, Freeze" : "Yes, Activate",
      type: isFreezing ? "danger" : "info",
      onConfirm: () => performToggleFreeze(walletId, currentStatus),
    });
  };

  const performToggleFreeze = async (walletId, currentStatus) => {
    const nextStatus = currentStatus === "yes" ? "no" : "yes";
    try {
      await api.patch(`/admin/wallets/${walletId}/freeze`, {
        isFrozen: nextStatus,
      });
      fetchWallets();
      if (selectedWallet && selectedWallet._id === walletId) {
        setSelectedWallet((prev) => ({ ...prev, isFrozen: nextStatus }));
      }
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (err) {
      alert("Failed to update wallet status");
    }
  };

  const settleCOD = async (id) => {
    if (!window.confirm("Confirm settlement?")) return;
    try {
      await api.put(`/admin/cod-ledger/${id}/settle`);
      fetchCOD();
    } catch (err) {
      alert("Failed to settle COD transaction");
    }
  };

  const handleWithdrawalAction = (id, status) => {
    if (status === "Rejected") {
      setReasonModal({ isOpen: true, id, status });
      return;
    }

    let title = "";
    let message = "";
    let btnText = "";
    let type = "info";
    let remarks = "";

    if (status === "Verified") {
      title = "Verify Withdrawal Request?";
      message =
        "Are you sure you want to verify this withdrawal? This will allow you to complete the payout in the next step.";
      btnText = "Yes, Verify";
      remarks = "Withdrawal verified";
    } else if (status === "Completed") {
      title = "Mark as Completed?";
      message =
        "Has the payout been processed successfully? This will mark the transaction as finished.";
      btnText = "Yes, Complete";
      remarks = "Withdrawal completed";
    }

    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmBtnText: btnText,
      type,
      onConfirm: () => performWithdrawalAction(id, status, remarks),
    });
  };

  const performWithdrawalAction = async (id, status, remarks) => {
    try {
      await api.put(`/admin/withdrawals/${id}`, { status, remarks });
      fetchWithdrawals();
      const updatedWallets = await fetchWallets();

      // Sync selectedWallet if it's active
      if (selectedWallet && updatedWallets) {
        const freshWallet = updatedWallets.find(
          (w) => w._id === selectedWallet._id,
        );
        if (freshWallet) setSelectedWallet(freshWallet);
      }

      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      setReasonModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      alert(`Failed to ${status.toLowerCase()} withdrawal`);
    }
  };

  // Helper Initials Renderer
  const renderInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "U";
  };

  return (
    <div className="admin-view-container">
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmBtnText={confirmModal.confirmBtnText}
        type={confirmModal.type}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
      />
      <ReasonModal
        isOpen={reasonModal.isOpen}
        title="Reason for Rejection"
        message="Please provide a clear reason why this withdrawal request is being rejected. This will be visible to the user."
        onClose={() => setReasonModal({ ...reasonModal, isOpen: false })}
        onConfirm={(reason) =>
          performWithdrawalAction(reasonModal.id, reasonModal.status, reason)
        }
      />

      {loading && (!walletsCache || !codCache || !withdrawalsCache) ? (
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      ) : (
        <>
          {/* 1. GRID VIEW */}
          {!selectedWallet && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {wallets.map((w) => (
                <div
                  key={w._id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    border: "1px solid #f3f4f6",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                  }}
                >
                  {/* Profile Image */}
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      marginBottom: "1rem",
                      border: "3px solid #f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      fontSize: "1.5rem",
                      fontWeight: "600",
                      overflow: "hidden",
                    }}
                  >
                    {w.userId?.profileImage ? (
                      <img
                        src={w.userId.profileImage}
                        alt={w.userId?.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerText = renderInitials(
                            w.userId?.name,
                          );
                        }}
                      />
                    ) : (
                      renderInitials(w.userId?.name)
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#1f2937",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {w.userId?.name}
                  </h3>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.9rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {w.userId?.email}
                  </p>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      color: "#9ca3af",
                      fontWeight: "600",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {w.userId?.role}
                  </span>

                  {/* Mini Stats (Preview) */}
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      backgroundColor: "#f9fafb",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                        Available
                      </div>
                      <div style={{ color: "#166534", fontWeight: "700" }}>
                        Rs. {w.availableBalance}
                      </div>
                    </div>
                    <div
                      style={{
                        width: "1px",
                        backgroundColor: "#e5e7eb",
                        margin: "0 0.5rem",
                      }}
                    ></div>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                        Locked
                      </div>
                      <div style={{ color: "#ef4444", fontWeight: "700" }}>
                        Rs. {w.lockedBalance}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "auto", width: "100%" }}>
                    <button
                      onClick={() => setSelectedWallet(w)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        backgroundColor: "#1dc956",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      View Wallet Details
                    </button>
                  </div>
                </div>
              ))}
              {wallets.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "4rem",
                    color: "#6b7280",
                  }}
                >
                  No wallets found
                </div>
              )}
            </div>
          )}

          {/* 2. DETAIL VIEW (Drilldown) */}
          {selectedWallet && (
            <div className="um-detail-view">
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "2rem",
                  gap: "1rem",
                }}
              >
                <button
                  onClick={() => setSelectedWallet(null)}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    padding: "0.5rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaArrowLeft color="#374151" />
                </button>
                <div>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#1f2937",
                      margin: 0,
                    }}
                  >
                    {selectedWallet.userId?.name}'s Wallet
                  </h2>
                  <p
                    style={{
                      color: "#6b7280",
                      margin: "0.25rem 0 0",
                      fontSize: "0.9rem",
                    }}
                  >
                    {selectedWallet.userId?.role} • {selectedWallet.userId?.email}
                  </p>
                </div>
              </div>

              {/* User Specific Tabs */}
              <div className="um-tabs">
                <button
                  className={`tab-btn ${
                    activeDetailTab === "status" ? "active" : ""
                  }`}
                  onClick={() => setActiveDetailTab("status")}
                >
                  Wallet Status
                </button>
                <button
                  className={`tab-btn ${activeDetailTab === "cod" ? "active" : ""}`}
                  onClick={() => setActiveDetailTab("cod")}
                >
                  COD Settlements
                </button>
                <button
                  className={`tab-btn ${
                    activeDetailTab === "requests" ? "active" : ""
                  }`}
                  onClick={() => setActiveDetailTab("requests")}
                >
                  Withdrawal Requests
                </button>
              </div>

              <div className="um-table-container">
                {/* TAB 1: STATUS */}
                {activeDetailTab === "status" && (
                  <div style={{ padding: "2rem" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "2rem",
                        marginBottom: "2rem",
                      }}
                    >
                      {/* Available Balance Card */}
                      <div
                        style={{
                          backgroundColor: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          padding: "1.5rem",
                          borderRadius: "12px",
                          textAlign: "center",
                        }}
                      >
                        <h4
                          style={{
                            margin: "0 0 0.5rem",
                            color: "#166534",
                            fontSize: "1rem",
                          }}
                        >
                          Available Balance
                        </h4>
                        <div
                          style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "#166534",
                          }}
                        >
                          Rs. {selectedWallet.availableBalance}
                        </div>
                      </div>

                      {/* Locked Balance Card */}
                      <div
                        style={{
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fecaca",
                          padding: "1.5rem",
                          borderRadius: "12px",
                          textAlign: "center",
                        }}
                      >
                        <h4
                          style={{
                            margin: "0 0 0.5rem",
                            color: "#991b1b",
                            fontSize: "1rem",
                          }}
                        >
                          Locked Balance
                        </h4>
                        <div
                          style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "#991b1b",
                          }}
                        >
                          Rs. {selectedWallet.lockedBalance}
                        </div>
                      </div>

                      {/* Total Earnings Card */}
                      <div
                        style={{
                          backgroundColor: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          padding: "1.5rem",
                          borderRadius: "12px",
                          textAlign: "center",
                        }}
                      >
                        <h4
                          style={{
                            margin: "0 0 0.5rem",
                            color: "#1e40af",
                            fontSize: "1rem",
                          }}
                        >
                          Total Earnings
                        </h4>
                        <div
                          style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "#1e40af",
                          }}
                        >
                          Rs. {selectedWallet.totalEarnings}
                        </div>
                      </div>
                      {/* Account Status Card */}
                      <div
                        style={{
                          backgroundColor:
                            selectedWallet.isFrozen === "yes"
                              ? "#fef2f2"
                              : "#f0fdf4",
                          border: `1px solid ${selectedWallet.isFrozen === "yes" ? "#fecaca" : "#bbf7d0"}`,
                          padding: "1.5rem",
                          borderRadius: "12px",
                          textAlign: "center",
                        }}
                      >
                        <h4
                          style={{
                            margin: "0 0 0.5rem",
                            color:
                              selectedWallet.isFrozen === "yes"
                                ? "#991b1b"
                                : "#166534",
                            fontSize: "1rem",
                          }}
                        >
                          Account Status
                        </h4>
                        <div
                          style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            color:
                              selectedWallet.isFrozen === "yes"
                                ? "#ef4444"
                                : "#10b981",
                          }}
                        >
                          {selectedWallet.isFrozen === "yes" ? "Freezed" : "Active"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "1.5rem",
                      }}
                    >
                      <button
                        onClick={() =>
                          toggleFreeze(selectedWallet._id, selectedWallet.isFrozen)
                        }
                        style={{
                          padding: "0.75rem 1.5rem",
                          backgroundColor:
                            selectedWallet.isFrozen === "yes"
                              ? "#10b981"
                              : "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                        }}
                      >
                        {selectedWallet.isFrozen === "yes"
                          ? "Set Active"
                          : "Freeze Account"}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: COD SETTLEMENTS */}
                {activeDetailTab === "cod" && (
                  <table className="um-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Buyer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codTxns
                        .filter(
                          (t) =>
                            t.sellerId?._id === selectedWallet.userId?._id ||
                            t.sellerId === selectedWallet.userId?._id,
                        )
                        .map((t) => (
                          <tr key={t._id}>
                            <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td>
                              {t.buyerId?.name || "Unknown"}
                              <br />
                              <span
                                style={{ fontSize: "0.75rem", color: "#6b7280" }}
                              >
                                (Buyer)
                              </span>
                            </td>
                            <td style={{ fontWeight: "600" }}>Rs. {t.amount}</td>
                            <td>
                              <span
                                className={`um-status-badge ${
                                  t.status === "Completed"
                                    ? "status-verified"
                                    : "status-pending"
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td>
                              {t.status !== "Completed" && (
                                <button
                                  className="um-action-btn"
                                  style={{
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => settleCOD(t._id)}
                                >
                                  Verify Settle
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      {codTxns.filter(
                        (t) => t.sellerId?._id === selectedWallet.userId?._id,
                      ).length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            style={{ textAlign: "center", padding: "2rem" }}
                          >
                            No COD transactions found for this user.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {/* TAB 3: WITHDRAWAL REQUESTS */}
                {activeDetailTab === "requests" && (
                  <table className="um-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Payment Details</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals
                        .filter(
                          (w) =>
                            w.userId?._id === selectedWallet.userId?._id ||
                            w.userId === selectedWallet.userId?._id,
                        )
                        .map((w) => (
                          <tr key={w._id}>
                            <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                            <td style={{ fontWeight: "600", color: "#d97706" }}>
                              Rs. {w.amount}
                            </td>
                            <td>{w.paymentMethod}</td>
                            <td
                              style={{ maxWidth: "200px", wordBreak: "break-word" }}
                            >
                              {w.accountDetails}
                            </td>
                            <td>
                              <span
                                className={`um-status-badge ${
                                  w.status === "Completed"
                                    ? "status-verified"
                                    : w.status === "Verified" ||
                                        w.status === "Approved"
                                      ? "status-approved"
                                      : w.status === "Rejected"
                                        ? "status-unverified"
                                        : "status-pending"
                                }`}
                              >
                                {w.status}
                              </span>
                            </td>
                            <td>
                              {w.status === "Pending" && (
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                  <button
                                    onClick={() =>
                                      handleWithdrawalAction(w._id, "Verified")
                                    }
                                    style={{
                                      backgroundColor: "#10b981",
                                      color: "white",
                                      border: "none",
                                      padding: "0.4rem 0.8rem",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Verify
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleWithdrawalAction(w._id, "Rejected")
                                    }
                                    style={{
                                      backgroundColor: "#ef4444",
                                      color: "white",
                                      border: "none",
                                      padding: "0.4rem 0.8rem",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {(w.status === "Verified" ||
                                w.status === "Approved") && (
                                <button
                                  onClick={() =>
                                    handleWithdrawalAction(w._id, "Completed")
                                  }
                                  style={{
                                    backgroundColor: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Complete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      {withdrawals.filter(
                        (w) => w.userId?._id === selectedWallet.userId?._id,
                      ).length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            style={{ textAlign: "center", padding: "2rem" }}
                          >
                            No withdrawal requests found for this user.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminWalletView;
