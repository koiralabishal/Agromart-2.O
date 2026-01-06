import React from 'react';
import { FaLeaf, FaTruck, FaMapMarkedAlt, FaChartBar, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CollectorDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Collector' };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <FaLeaf /> <span>AgroMart</span>
        </div>
        <nav style={styles.nav}>
          <div style={{...styles.navItem, ...styles.activeItem}}><FaChartBar /> Logistics Overview</div>
          <div style={styles.navItem}><FaTruck /> Active Pickups</div>
          <div style={styles.navItem}><FaMapMarkedAlt /> Route Map</div>
          <div 
            style={{ ...styles.navItem, marginTop: "auto", color: "#ffbbbb" }} 
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </div>
        </nav>
      </aside>

      <main style={styles.content}>
        <header style={styles.header}>
          <h1>Collector Dashboard</h1>
          <div style={styles.userInfo}>
            <FaUserCircle /> <span>{user.name}</span>
          </div>
        </header>

        <section style={styles.stats}>
          <div style={styles.statCard}>
            <h3>Total Pickups</h3>
            <p>156</p>
          </div>
          <div style={styles.statCard}>
            <h3>Pending Tasks</h3>
            <p>8</p>
          </div>
          <div style={styles.statCard}>
            <h3>On-Time Rate</h3>
            <p>98%</p>
          </div>
        </section>

        <section style={styles.welcomeSection}>
          <h2>Welcome back, {user.name}!</h2>
          <p>Ready to manage the supply chain today?</p>
        </section>
      </main>
    </div>
  );
};

const styles = {
  dashboardContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' },
  sidebar: { width: '250px', backgroundColor: '#21618c', color: 'white', padding: '2rem' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem' },
  nav: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' },
  activeItem: { backgroundColor: 'rgba(255,255,255,0.1)' },
  content: { flex: 1, padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  welcomeSection: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px' }
};

export default CollectorDashboard;
