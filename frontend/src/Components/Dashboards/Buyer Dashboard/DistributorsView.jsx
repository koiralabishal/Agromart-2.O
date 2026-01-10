import React, { useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaHome, FaPhone, FaTruck } from "react-icons/fa";
import "./Styles/DistributorsView.css";

const DistributorsView = ({ onViewProfile }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const distributors = [
    {
      id: 1,
      name: "Prime Distribution Co.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=PrimeDist",
      location: "Kathmandu, Nepal",
      centerAddress: "123 Distribution Hub, Kathmandu 44600",
      centerName: "Prime Distribution Center",
      contact: "+977 1-4987654",
      status: "online"
    },
    {
      id: 2,
      name: "Swift Logistics",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Swift",
      location: "Pokhara, Nepal",
      centerAddress: "456 Logistics Park, Pokhara 33700",
      centerName: "Swift Distribution Hub",
      contact: "+977 61-567890",
      status: "online"
    },
    {
      id: 3,
      name: "Valley Distributors",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Valley",
      location: "Lalitpur, Nepal",
      centerAddress: "789 Supply Chain Rd, Lalitpur 44700",
      centerName: "Valley Distribution Point",
      contact: "+977 1-5987654",
      status: "online"
    },
    {
      id: 4,
      name: "Express Distribution",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Express",
      location: "Bhaktapur, Nepal",
      centerAddress: "101 Warehouse Ave, Bhaktapur 44800",
      centerName: "Express Distribution Hub",
      contact: "+977 1-6987654",
      status: "online"
    },
    {
      id: 5,
      name: "Metro Distributors Ltd",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Metro",
      location: "Chitwan, Nepal",
      centerAddress: "202 Distribution Plaza, Chitwan 44200",
      centerName: "Metro Distribution Center",
      contact: "+977 56-987654",
      status: "online"
    },
    {
      id: 6,
      name: "Nationwide Distribution",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nationwide",
      location: "Biratnagar, Nepal",
      centerAddress: "303 Supply Hub, Biratnagar 56600",
      centerName: "Nationwide Distribution Point",
      contact: "+977 21-567890",
      status: "online"
    },
    {
      id: 7,
      name: "Rapid Distributors",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rapid",
      location: "Butwal, Nepal",
      centerAddress: "404 Logistics Center, Butwal 32900",
      centerName: "Rapid Distribution Hub",
      contact: "+977 71-987654",
      status: "online"
    },
    {
      id: 8,
      name: "Elite Distribution Co.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elite",
      location: "Dharan, Nepal",
      centerAddress: "505 Distribution St, Dharan 56700",
      centerName: "Elite Distribution Center",
      contact: "+977 25-987654",
      status: "online"
    }
  ];

  const filteredDistributors = distributors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.centerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredDistributors.map(distributor => (
          <div key={distributor.id} className="distributor-card">
            <div className="card-top">
              <div className="image-wrapper">
                <img src={distributor.image} alt={distributor.name} />
                {distributor.status === "online" && <span className="status-dot"></span>}
              </div>
              <h3>{distributor.name}</h3>
            </div>
            <div className="card-details">
              <div className="detail-item">
                <FaMapMarkerAlt /> <span>Location: <strong>{distributor.location}</strong></span>
              </div>
              <div className="detail-item">
                <FaHome /> <span>Center Address: {distributor.centerAddress}</span>
              </div>
              <div className="detail-item">
                <FaTruck /> <span>Center Name: {distributor.centerName}</span>
              </div>
              <div className="detail-item">
                <FaPhone /> <span>Contact: {distributor.contact}</span>
              </div>
            </div>
            <button className="view-btn" onClick={() => onViewProfile(distributor)}>View Products</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributorsView;
