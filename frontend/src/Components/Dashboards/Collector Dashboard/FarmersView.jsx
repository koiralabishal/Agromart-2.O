import React, { useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaHome, FaPhone, FaLeaf } from "react-icons/fa";
import "./Styles/FarmersView.css";

const FarmersView = ({ onViewProfile }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const farmers = [
    {
      id: 1,
      name: "Sarah Chen",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      location: "Springfield, IL",
      farmAddress: "123 Green Acres Rd, Springfield, IL 62704",
      farmName: "Golden Harvest Farms",
      contact: "(555) 123-4567",
      status: "online"
    },
    {
      id: 2,
      name: "David Rodriguez",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      location: "Riverside, CA",
      farmAddress: "456 Valley View Ln, Riverside, CA 92507",
      farmName: "Sunnyside Organic Farm",
      contact: "(555) 111-2222",
      status: "online"
    },
    {
      id: 3,
      name: "Emily White",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      location: "Portland, OR",
      farmAddress: "789 Berry Patch Way, Portland, OR 97204",
      farmName: "Rose City Produce",
      contact: "(555) 333-4444",
      status: "online"
    },
    {
      id: 4,
      name: "Michael Brown",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      location: "Atlanta, GA",
      farmAddress: "101 Peach Tree Rd, Atlanta, GA 30303",
      farmName: "Southern Star Crops",
      contact: "(555) 555-6666",
      status: "online"
    },
    {
      id: 5,
      name: "Jessica Lee",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
      location: "Austin, TX",
      farmAddress: "202 Lone Star Blvd, Austin, TX 78701",
      farmName: "Texan Fields Farms",
      contact: "(555) 777-8888",
      status: "online"
    },
    {
      id: 6,
      name: "Robert Davis",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
      location: "Denver, CO",
      farmAddress: "303 Rocky Mountain Ave, Denver, CO 80202",
      farmName: "Mile High Produce",
      contact: "(555) 222-3333",
      status: "online"
    },
    {
      id: 7,
      name: "Laura Wilson",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura",
      location: "Orlando, FL",
      farmAddress: "404 Sunshine Dr, Orlando, FL 32801",
      farmName: "Citrus Grove Farms",
      contact: "(555) 444-5555",
      status: "online"
    },
    {
      id: 8,
      name: "Kevin Miller",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin",
      location: "Seattle, WA",
      farmAddress: "505 Evergreen Ln, Seattle, WA 98101",
      farmName: "Emerald City Organics",
      contact: "(555) 666-7777",
      status: "online"
    },
    {
      id: 9,
      name: "Olivia Jones",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
      location: "Boston, MA",
      farmAddress: "606 Freedom Trail, Boston, MA 02108",
      farmName: "New England Harvest",
      contact: "(555) 888-9999",
      status: "online"
    }
  ];

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.farmName.toLowerCase().includes(searchTerm.toLowerCase())
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
        {filteredFarmers.map(farmer => (
          <div key={farmer.id} className="farmer-card">
            <div className="card-top">
              <div className="image-wrapper">
                <img src={farmer.image} alt={farmer.name} />
                {farmer.status === "online" && <span className="status-dot"></span>}
              </div>
              <h3>{farmer.name}</h3>
            </div>
            <div className="card-details">
              <div className="detail-item">
                <FaMapMarkerAlt /> <span>Location: <strong>{farmer.location}</strong></span>
              </div>
              <div className="detail-item">
                <FaHome /> <span>Farm Address: {farmer.farmAddress}</span>
              </div>
              <div className="detail-item">
                <FaLeaf /> <span>Farm Name: {farmer.farmName}</span>
              </div>
              <div className="detail-item">
                <FaPhone /> <span>Contact: {farmer.contact}</span>
              </div>
            </div>
            <button className="view-btn" onClick={() => onViewProfile(farmer)}>View Products</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmersView;
