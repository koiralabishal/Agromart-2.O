import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";
import Pagination from "../../Common/Pagination";

const AdminDisputesView = ({ cache, onCacheUpdate }) => {
  const [disputes, setDisputes] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    const isSimple = action === "None";
    const amount =
      !isSimple && action === "Refund" ? prompt("Enter Refund Amount:") : 0;
    const comments = isSimple
      ? "Dispute resolved by admin"
      : prompt("Admin Comments:");

    try {
      await api.put(`/admin/disputes/${id}/resolve`, {
        action: isSimple ? "None" : action,
        refundAmount: amount,
        adminComments: comments,
      });
      fetchDisputes();
    } catch (err) {
      alert("Failed to resolve dispute");
    }
  };

  const paginatedDisputes = disputes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
                <th>Reason</th>
                <th>Evidence</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDisputes.map((d) => (
                <tr key={d._id}>
                  <td>{d.orderID}</td>
                  <td>{d.raisedBy?.name}</td>
                  <td>{d.reason}</td>
                  <td>
                    {d.evidenceImages && d.evidenceImages.length > 0 ? (
                      <div className="dm-evidence-thumbs">
                        {d.evidenceImages.map((img, idx) => (
                          <a
                            key={idx}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={img}
                              alt="Evidence"
                              className="dm-thumb"
                              title="Click to view full image"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                        No evidence
                      </span>
                    )}
                  </td>
                  <td>{d.status}</td>
                  <td>
                    {d.status === "Open" ? (
                      <>
                        <button
                          className="um-action-btn"
                          style={{
                            backgroundColor: "var(--primary-green)",
                            color: "white",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                          }}
                          onClick={() => handleResolve(d._id, "None")}
                        >
                          Resolve
                        </button>
                      </>
                    ) : (
                      <span style={{ color: "#1dc956", fontWeight: "600" }}>
                        Resolved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {disputes.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No disputes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {disputes.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={disputes.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      )}
    </div>
  );
};
export default AdminDisputesView;
