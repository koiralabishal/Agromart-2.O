import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";
import { FaTrash, FaSearch, FaEye, FaArrowLeft, FaUser } from "react-icons/fa";
import ConfirmationModal from "../../Common/ConfirmationModal";
import Pagination from "../../Common/Pagination";


const AdminProductsView = ({ cache, onCacheUpdate }) => {
  const [products, setProducts] = useState(cache || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [loading, setLoading] = useState(!cache);
  const [currentFarmerPage, setCurrentFarmerPage] = useState(1);
  const [currentProductPage, setCurrentProductPage] = useState(1);


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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!cache) setLoading(true);
    try {
      const res = await api.get("/admin/products");
      const allProducts = res.data;
      setProducts(allProducts);
      onCacheUpdate(allProducts);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product?",
      message: `Are you sure you want to delete ${product.productName}?`,
      type: "danger",
      confirmBtnText: "Yes, Delete",
      onConfirm: () => performDelete(product._id),
    });
  };

  const performDelete = async (id) => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  // Group products by Farmer
  const farmersMap = {};
  products.forEach((p) => {
    if (p.userID?.role === "farmer") {
      const id = p.userID._id;
      if (!farmersMap[id]) {
        farmersMap[id] = {
          user: p.userID,
          products: [],
        };
      }
      farmersMap[id].products.push(p);
    }
  });
  const farmersList = Object.values(farmersMap);

  // Filter Logic for Table View
  const filteredProducts = selectedFarmer
    ? products.filter((p) => {
        const belongsToFarmer = p.userID?._id === selectedFarmer.user._id;
        const matchesSearch = p.productName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          categoryFilter === "All" ||
          (p.category &&
            (p.category.toLowerCase() === categoryFilter.toLowerCase() ||
              p.category.toLowerCase() + "s" === categoryFilter.toLowerCase() ||
              p.category.toLowerCase() === categoryFilter.toLowerCase() + "s"));
        return belongsToFarmer && matchesSearch && matchesCategory;
      })
    : [];

  const itemsPerPage = 10;
  const paginatedFarmers = farmersList.slice(
    (currentFarmerPage - 1) * itemsPerPage,
    currentFarmerPage * itemsPerPage,
  );

  const paginatedProducts = filteredProducts.slice(
    (currentProductPage - 1) * itemsPerPage,
    currentProductPage * itemsPerPage,
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
          {/* VIEW: FARMER LIST */}
          {!selectedFarmer && (
            <>
              <div className="um-header">
                <h2 className="um-title">Registered Farmers</h2>
              </div>
              <div
                className="ad-stats-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {paginatedFarmers.map((data) => (
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
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                    <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1rem" }}>
                      {data.user.email}
                    </p>
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
                      {data.products.length} Products Listed
                    </div>

                    <div style={{ width: "100%", marginTop: "auto" }}>
                      <button
                        onClick={() => setSelectedFarmer(data)}
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
                        <FaEye /> View Products
                      </button>
                    </div>
                  </div>
                ))}
                {farmersList.length === 0 && (
                  <div style={{ color: "#6b7280", padding: "2rem" }}>No farmers found with products.</div>
                )}
              </div>

              <Pagination
                currentPage={currentFarmerPage}
                totalItems={farmersList.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentFarmerPage(page)}
              />

            </>
          )}

          {/* VIEW: PRODUCT DETAILS TABLE */}
          {selectedFarmer && (
            <>
              <div className="um-header">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <button
                    onClick={() => setSelectedFarmer(null)}
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
                    title="Back to Farmers List"
                  >
                    <FaArrowLeft />
                  </button>
                  <div>
                    <h2 className="um-title" style={{ marginBottom: "0.2rem" }}>
                      {selectedFarmer.user.name}'s Products
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      {selectedFarmer.user.email}
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
                      placeholder="Search Product..."
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
                      <th>Product Image</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentProductPage}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentProductPage(page)}
              />

            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProductsView;
