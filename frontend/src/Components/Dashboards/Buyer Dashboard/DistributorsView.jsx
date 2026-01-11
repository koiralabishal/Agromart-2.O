import React, { useState, useEffect } from "react";
import { FaSearch, FaMapMarkerAlt, FaHome, FaPhone, FaTruck, FaEnvelope } from "react-icons/fa";
import api from "../../../api/axiosConfig";
import "./Styles/DistributorsView.css";

const DistributorsView = ({ onViewProfile, preFetchedDistributors }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Immediate data: use pre-fetched data if available, otherwise check local storage cache
  const [distributors, setDistributors] = useState(() => {
    if (preFetchedDistributors) return preFetchedDistributors;
    const cached = localStorage.getItem("cached_active_distributors");
    return cached ? JSON.parse(cached) : null;
  });
  
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have pre-fetched data, sync it immediately
    if (preFetchedDistributors) {
      setDistributors(preFetchedDistributors);
    }
    // Always perform a background fetch to ensure fresh data
    fetchActiveDistributors();
  }, [preFetchedDistributors]);

  const fetchActiveDistributors = async () => {
    try {
      const response = await api.get("/users/active-distributors");
      setDistributors(response.data);
      localStorage.setItem("cached_active_distributors", JSON.stringify(response.data));
      setError(null);
    } catch (err) {
      console.error("Error fetching active distributors:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch active distributors");
      setDistributors((prev) => prev || []); // Fallback to empty if no cache
    }
  };

  const filteredDistributors = (distributors || []).filter(d => {
    const nameMatch = d.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const companyMatch = d.supplierDetails?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = d.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || companyMatch || emailMatch;
  });

  return (
    <div className="distributors-view-container">
      <div className="dv-header">
        <h1>Distributor Profiles</h1>
        <div className="dv-search">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search distributors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="distributors-grid">
        {error ? (
          <div className="dv-status-message error">
            <p>Oops! Something went wrong: {error}</p>
            <button onClick={fetchActiveDistributors} className="retry-btn">Try Again</button>
          </div>
        ) : distributors === null ? (
          <div className="dv-status-message">
            {/* Subtle loading state */}
          </div>
        ) : filteredDistributors.length > 0 ? (
          filteredDistributors.map(distributor => (
            <div key={distributor._id} className="distributor-card">
              <div className="card-top">
                <div className="image-wrapper">
                  <img 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${distributor.supplierDetails?.name || distributor.name}`} 
                    alt={distributor.name} 
                  />
                  <span className="status-dot"></span>
                </div>
                <h3 className="distributor-owner">{distributor.name}</h3>
                {/* <p className="distributor-owner">Proprietor: {distributor.name}</p> */}
              </div>
              <div className="card-details">
                <div className="detail-item">
                  <FaMapMarkerAlt /> <span>Location: <strong>{distributor.supplierDetails?.location || "N/A"}</strong></span>
                </div>
                <div className="detail-item">
                  <FaEnvelope /> <span>Email: {distributor.email}</span>
                </div>
                <div className="detail-item">
                  <FaPhone /> <span>Contact: {distributor.phone}</span>
                </div>
                <div className="detail-item">
                  <FaTruck /> <span>Company: {distributor.supplierDetails?.companyName || "N/A"}</span>
                </div>
              </div>
              <button 
                className="view-btn" 
                onClick={() => onViewProfile(distributor)}
              >
                View Products
              </button>
            </div>
          ))
        ) : (
          <div className="dv-empty">
            <FaTruck className="empty-icon" />
            <h3>No Active Distributors Found</h3>
            <p>
              It looks like there are no distributors with available inventory at
              the moment. Check back later to see new stock items!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributorsView;
