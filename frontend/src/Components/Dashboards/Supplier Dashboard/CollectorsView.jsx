import React, { useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaHome, FaPhone, FaWarehouse } from "react-icons/fa";
import "./Styles/CollectorsView.css";

const CollectorsView = ({ onViewProfile }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const collectors = [
    {
      id: 1,
      name: "Green Valley Collectors",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=GreenValley",
      location: "Kathmandu, Nepal",
      centerAddress: "123 Collection Center Rd, Kathmandu 44600",
      centerName: "Green Valley Collection Hub",
      contact: "+977 1-4123456",
      status: "online"
    },
    {
      id: 2,
      name: "Fresh Harvest Co.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=FreshHarvest",
      location: "Pokhara, Nepal",
      centerAddress: "456 Market St, Pokhara 33700",
      centerName: "Fresh Harvest Center",
      contact: "+977 61-234567",
      status: "online"
    },
    {
      id: 3,
      name: "Mountain Produce",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mountain",
      location: "Lalitpur, Nepal",
      centerAddress: "789 Agro Lane, Lalitpur 44700",
      centerName: "Mountain Collection Point",
      contact: "+977 1-5123456",
      status: "online"
    },
    {
      id: 4,
      name: "Valley Fresh Collectors",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=ValleyFresh",
      location: "Bhaktapur, Nepal",
      centerAddress: "101 Farm Road, Bhaktapur 44800",
      centerName: "Valley Fresh Hub",
      contact: "+977 1-6123456",
      status: "online"
    },
    {
      id: 5,
      name: "Organic Collectors Ltd",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Organic",
      location: "Chitwan, Nepal",
      centerAddress: "202 Agro Park, Chitwan 44200",
      centerName: "Organic Collection Center",
      contact: "+977 56-123456",
      status: "online"
    },
    {
      id: 6,
      name: "Himalayan Harvest",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Himalayan",
      location: "Biratnagar, Nepal",
      centerAddress: "303 Produce Ave, Biratnagar 56600",
      centerName: "Himalayan Collection Hub",
      contact: "+977 21-234567",
      status: "online"
    },
    {
      id: 7,
      name: "Everest Collectors",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Everest",
      location: "Butwal, Nepal",
      centerAddress: "404 Market Plaza, Butwal 32900",
      centerName: "Everest Collection Point",
      contact: "+977 71-123456",
      status: "online"
    },
    {
      id: 8,
      name: "Nepal Fresh Co.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=NepalFresh",
      location: "Dharan, Nepal",
      centerAddress: "505 Agro Street, Dharan 56700",
      centerName: "Nepal Fresh Center",
      contact: "+977 25-123456",
      status: "online"
    },
    {
      id: 9,
      name: "Prime Collectors",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prime",
      location: "Hetauda, Nepal",
      centerAddress: "606 Collection Blvd, Hetauda 44100",
      centerName: "Prime Collection Hub",
      contact: "+977 57-123456",
      status: "online"
    }
  ];

  const filteredCollectors = collectors.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.centerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredCollectors.map(collector => (
          <div key={collector.id} className="collector-card">
            <div className="card-top">
              <div className="image-wrapper">
                <img src={collector.image} alt={collector.name} />
                {collector.status === "online" && <span className="status-dot"></span>}
              </div>
              <h3>{collector.name}</h3>
            </div>
            <div className="card-details">
              <div className="detail-item">
                <FaMapMarkerAlt /> <span>Location: <strong>{collector.location}</strong></span>
              </div>
              <div className="detail-item">
                <FaHome /> <span>Center Address: {collector.centerAddress}</span>
              </div>
              <div className="detail-item">
                <FaWarehouse /> <span>Center Name: {collector.centerName}</span>
              </div>
              <div className="detail-item">
                <FaPhone /> <span>Contact: {collector.contact}</span>
              </div>
            </div>
            <button className="view-btn" onClick={() => onViewProfile(collector)}>View Products</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectorsView;
