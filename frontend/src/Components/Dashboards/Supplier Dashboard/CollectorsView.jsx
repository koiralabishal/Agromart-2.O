import React, { useState, useEffect } from "react";
import { FaSearch, FaMapMarkerAlt, FaHome, FaPhone, FaWarehouse, FaEnvelope } from "react-icons/fa";
import api from "../../../api/axiosConfig";
import "./Styles/CollectorsView.css";

const CollectorsView = ({ onViewProfile, preFetchedCollectors }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Immediate data: use pre-fetched data if available, otherwise check local storage cache
  const [collectors, setCollectors] = useState(() => {
    if (preFetchedCollectors) return preFetchedCollectors;
    const cached = localStorage.getItem("cached_active_collectors");
    return cached ? JSON.parse(cached) : null;
  });
  
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have pre-fetched data, sync it immediately
    if (preFetchedCollectors) {
      setCollectors(preFetchedCollectors);
    }
    // Always perform a background fetch to ensure fresh data
    fetchActiveCollectors();
  }, [preFetchedCollectors]);

  const fetchActiveCollectors = async () => {
    try {
      const response = await api.get("/users/active-collectors");
      setCollectors(response.data);
      localStorage.setItem("cached_active_collectors", JSON.stringify(response.data));
      setError(null);
    } catch (err) {
      console.error("Error fetching active collectors:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch active collectors");
      setCollectors((prev) => prev || []); // Fallback to empty if no cache
    }
  };

  const filteredCollectors = (collectors || []).filter(c => {
    const nameMatch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const companyMatch = c.collectorDetails?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || companyMatch || emailMatch;
  });

  return (
    <div className="collectors-view-container">
      <div className="cv-header">
        <h1>Collector Profiles</h1>
        <div className="cv-search">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search collectors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="collectors-grid">
        {error ? (
          <div className="cv-status-message error">
            <p>Oops! Something went wrong: {error}</p>
            <button onClick={fetchActiveCollectors} className="retry-btn">Try Again</button>
          </div>
        ) : collectors === null ? (
          <div className="cv-status-message">
            {/* Subtle loading state */}
          </div>
        ) : filteredCollectors.length > 0 ? (
          filteredCollectors.map(collector => (
            <div key={collector._id} className="collector-card">
              <div className="card-top">
                <div className="image-wrapper">
                  <img 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${collector.name}`} 
                    alt={collector.name} 
                  />
                  <span className="status-dot"></span>
                </div>
                {/* <h3>{collector.collectorDetails?.companyName || collector.name}</h3> */}
                <h3 className="collector-owner">{collector.name}</h3>
              </div>
              <div className="card-details">
                <div className="detail-item">
                  <FaMapMarkerAlt /> <span>Location: <strong>{collector.collectorDetails?.location || "N/A"}</strong></span>
                </div>
                <div className="detail-item">
                  <FaEnvelope /> <span>Email: {collector.email}</span>
                </div>
                <div className="detail-item">
                  <FaPhone /> <span>Contact: {collector.phone}</span>
                </div>
                <div className="detail-item">
                  <FaWarehouse /> <span>Company: {collector.collectorDetails?.companyName || "N/A"}</span>
                </div>
              </div>
              <button 
                className="view-btn" 
                onClick={() => onViewProfile(collector)}
              >
                View Products
              </button>
            </div>
          ))
        ) : (
          <div className="cv-empty">
            <FaWarehouse className="empty-icon" />
            <h3>No Active Collectors Found</h3>
            <p>
              It looks like there are no collectors with available inventory at
              the moment. Check back later to see new stock items!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorsView;
