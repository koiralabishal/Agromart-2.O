import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";

const AdminDisputesView = ({ cache, onCacheUpdate }) => {
  const [disputes, setDisputes] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    if (!cache) setLoading(true);
    try {
      const res = await api.get("/admin/disputes");
      setDisputes(res.data);
      onCacheUpdate(res.data);
    } catch (err) {
      console.error("Failed to fetch disputes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, action) => {
    const amount = action === 'Refund' ? prompt("Enter Refund Amount:") : 0;
    const comments = prompt("Admin Comments:");
    
    try {
      await api.put(`/admin/disputes/${id}/resolve`, {
          action,
          refundAmount: amount,
          adminComments: comments
      });
      fetchDisputes();
    } catch (err) {
      alert("Failed to resolve dispute");
    }
  };

  return (
    <div className="admin-view-container">
      <h2 className="um-title">Dispute Resolution</h2>
      {loading && !cache ? (
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      ) : (
        <div className="um-table-container">
          <table className="um-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Raised By</th>
                <th>Against</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map(d => (
                <tr key={d._id}>
                  <td>{d.orderID}</td>
                  <td>{d.raisedBy?.name}</td>
                  <td>{d.sellerID?.name}</td>
                  <td>{d.reason}</td>
                  <td>{d.status}</td>
                  <td>
                    {d.status === 'Open' ? (
                       <>
                          <button className="um-action-btn" onClick={() => handleResolve(d._id, 'Refund')}>Refund</button>
                          <button className="um-action-btn btn-delete" onClick={() => handleResolve(d._id, 'Dismissed')}>Dismiss</button>
                       </>
                    ) : (
                        <span>{d.resolution?.action}</span>
                    )}
                  </td>
                </tr>
              ))}
              {disputes.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>No disputes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AdminDisputesView;
