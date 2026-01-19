import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";
import { FaTrash, FaSearch, FaEye, FaArrowLeft } from "react-icons/fa";
import ConfirmationModal from "../../Common/ConfirmationModal";
import Pagination from "../../Common/Pagination";


const AdminInventoryView = ({ cache, onCacheUpdate }) => {
  const [inventory, setInventory] = useState(cache || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(!cache);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [currentItemPage, setCurrentItemPage] = useState(1);
  const itemsPerPage = 10;


  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmBtnText: "",
    onConfirm: null,
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    if (!cache) setLoading(true);
    try {
      const res = await api.get("/admin/inventory");
      setInventory(res.data);
      onCacheUpdate(res.data);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Inventory Item?",
      message: `Are you sure you want to delete ${item.productName}?`,
      type: "danger",
      confirmBtnText: "Yes, Delete",
      onConfirm: () => performDelete(item._id),
    });
  };

  const performDelete = async (id) => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      await api.delete(`/admin/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      alert("Failed to delete inventory item");
    }
  };

  // Group by User (Collector/Supplier/Distributor)
  const usersMap = {};
  inventory.forEach((item) => {
    const role = item.userID?.role?.toLowerCase();
    if (role === "collector" || role === "supplier" || role === "distributor") {
      const id = item.userID._id;
      if (!usersMap[id]) {
        usersMap[id] = {
          user: item.userID,
          items: [],
        };
      }
      usersMap[id].items.push(item);
    }
  });
  const usersList = Object.values(usersMap);

  // Filter Logic for Table View
  const filteredInventory = selectedUser
    ? inventory.filter((i) => {
        const belongsToUser = i.userID?._id === selectedUser.user._id;
        const matchesSearch = i.productName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          categoryFilter === "All" ||
          (i.category &&
            (i.category.toLowerCase() === categoryFilter.toLowerCase() ||
              i.category.toLowerCase() + "s" === categoryFilter.toLowerCase() ||
              i.category.toLowerCase() === categoryFilter.toLowerCase() + "s"));
        return belongsToUser && matchesSearch && matchesCategory;
      })
    : [];

  const paginatedUsers = usersList.slice(
    (currentUserPage - 1) * itemsPerPage,
    currentUserPage * itemsPerPage,
  );

  const paginatedItems = filteredInventory.slice(
    (currentItemPage - 1) * itemsPerPage,
    currentItemPage * itemsPerPage,
  );


  return (
    <div className="admin-view-container">
      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmBtnText={confirmModal.confirmBtnText}
      />

      {previewImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{ maxHeight: "80vh", maxWidth: "90vw", borderRadius: "8px" }}
          />
        </div>
      )}

      {/* DATA VIEW */}
      {loading && !cache ? (
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      ) : (
        <>
          {/* VIEW: USER GRID */}
          {!selectedUser && (
            <>
              <div className="um-header">
                <h2 className="um-title">Collectors & Suppliers</h2>
              </div>
              <div
                className="ad-stats-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {paginatedUsers.map((data) => (
                  <div
                    key={data.user._id}
                    style={{
                      backgroundColor: "white",
                      padding: "1.5rem",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      border: "1px solid #e5e7eb",
                      transition: "transform 0.2s",
                    }}
                  >
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
                      {data.user.profileImage ? (
                        <img
                          src={data.user.profileImage}
                          alt={data.user.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerText = data.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase();
                          }}
                        />
                      ) : (
                        data.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
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
                      {data.user.name}
                    </h3>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.9rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {data.user.email}
                    </p>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        color: "#9ca3af",
                        fontWeight: "600",
                        marginBottom: "1rem",
                      }}
                    >
                      {data.user.role}
                    </span>

                    <div
                      style={{
                        backgroundColor: "#f0fdf4",
                        color: "#166534",
                        padding: "0.5rem 1rem",
                        borderRadius: "99px",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {data.items.length} Items Listed
                    </div>

                    <div style={{ width: "100%", marginTop: "auto" }}>
                      <button
                        onClick={() => setSelectedUser(data)}
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
                        <FaEye /> View Inventory
                      </button>
                    </div>
                  </div>
                ))}
                {usersList.length === 0 && (
                  <div style={{ color: "#6b7280", padding: "2rem" }}>
                    No collectors or suppliers found with inventory.
                  </div>
                )}
              </div>

              <Pagination
                currentPage={currentUserPage}
                totalItems={usersList.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentUserPage(page)}
              />

            </>
          )}

          {/* VIEW: ITEM DETAILS TABLE */}
          {selectedUser && (
            <>
              <div className="um-header">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <button
                    onClick={() => setSelectedUser(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#4b5563",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "1rem",
                      padding: "0.5rem",
                      borderRadius: "50%",
                      backgroundColor: "#f3f4f6",
                    }}
                    title="Back to List"
                  >
                    <FaArrowLeft />
                  </button>
                  <div>
                    <h2 className="um-title" style={{ marginBottom: "0.2rem" }}>
                      {selectedUser.user.name}'s Inventory
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      {selectedUser.user.role} - {selectedUser.user.email}
                    </span>
                  </div>
                </div>

                <div className="um-actions">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All Categories</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="ad-search-bar">
                    <FaSearch color="#9CA3AF" />
                    <input
                      type="text"
                      placeholder="Search Inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="um-table-container">
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>Item Image</th>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <img
                              src={p.productImage || "https://placehold.co/40"}
                              alt={p.productName}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid #e5e7eb",
                              }}
                            />
                            <button
                              className="um-action-btn btn-view"
                              onClick={() => setPreviewImage(p.productImage)}
                              title="View Image"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                        <td style={{ fontWeight: "600" }}>{p.productName}</td>
                        <td>{p.category}</td>
                        <td>
                          {p.quantity} {p.unit}
                        </td>
                        <td>Rs. {p.price}</td>
                        <td>
                          <span
                            className={`um-status-badge ${
                              p.availableStatus === "Available"
                                ? "status-verified"
                                : "status-unverified"
                            }`}
                          >
                            {p.availableStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteClick(p)}
                            className="um-action-btn btn-delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredInventory.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          style={{ textAlign: "center", padding: "2rem" }}
                        >
                          No items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentItemPage}
                totalItems={filteredInventory.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentItemPage(page)}
              />

            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminInventoryView;
