import React, { useState, useEffect } from "react";
import { FaSearch, FaMapMarkerAlt, FaHome, FaPhone, FaLeaf, FaSyncAlt, FaEnvelope } from "react-icons/fa";
import api from "../../../api/axiosConfig";
import "./Styles/FarmersView.css"

const FarmersView = ({ onViewProfile, preFetchedFarmers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Immediate data: use pre-fetched data if available, otherwise check local storage cache
  const [farmers, setFarmers] = useState(() => {
    if (preFetchedFarmers) return preFetchedFarmers;
    const cached = localStorage.getItem("cached_active_farmers");
    return cached ? JSON.parse(cached) : null;
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have pre-fetched data, sync it immediately
    if (preFetchedFarmers) {
      setFarmers(preFetchedFarmers);
    }
    // Always perform a background fetch to ensure fresh data
    fetchFarmers();
  }, [preFetchedFarmers]);

  const fetchFarmers = async () => {
    try {
      const response = await api.get("/users/active-farmers");
      setFarmers(response.data);
      localStorage.setItem("cached_active_farmers", JSON.stringify(response.data));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch active farmers");
      setFarmers((prev) => prev || []); // If no prev data, set to empty array
    }
  };

  const filteredFarmers = (farmers || []).filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.farmDetails?.farmName && f.farmDetails.farmName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="farmers-view-container">
      <div className="fv-header">
        <h1>Farmer Profiles</h1>
        <div className="fv-search">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search farmers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="farmers-grid">
        {error ? (
          <div className="fv-status-message error">
            <p>Oops! Something went wrong: {error}</p>
            <button onClick={fetchFarmers} className="retry-btn">Try Again</button>
          </div>
        ) : farmers === null ? (
          <div className="fv-status-message">
            {/* Keeping it empty or very subtle as requested to avoid 'loading' UI but prevent flicker */}
          </div>
        ) : filteredFarmers.length > 0 ? (
          filteredFarmers.map(farmer => (
            <div key={farmer._id} className="farmer-card">
              <div className="card-top">
                <div className="image-wrapper">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${farmer.name}`} alt={farmer.name} />
                  <span className="status-dot"></span>
                </div>
                <h3>{farmer.name}</h3>
              </div>
              <div className="card-details">
                <div className="detail-item">
                  <FaMapMarkerAlt /> <span>Location: <strong>{farmer.address.split(',')[0]}</strong></span>
                </div>
                <div className="detail-item">
                  <FaLeaf /> <span>Farm Name: {farmer.farmDetails?.farmName || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <FaPhone /> <span>Contact: {farmer.phone}</span>
                </div>
                <div className="detail-item">
                  <FaEnvelope /> <span>Email: {farmer.email}</span>
                </div>
              </div>
              <button className="view-btn" onClick={() => onViewProfile(farmer)}>View Products</button>
            </div>
          ))
        ) : (
          <div className="fv-empty">
            <FaLeaf className="empty-icon" />
            <h3>No Active Farmers Found</h3>
            <p>It looks like there are no farmers with listed products at the moment. Check back later to see new harvests!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmersView;
