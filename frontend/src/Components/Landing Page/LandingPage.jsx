import React, { useState, useEffect, useRef } from "react";
import {
  FaLeaf,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaChartLine,
  FaShippingFast,
  FaUserShield,
  FaMobileAlt,
  FaDatabase,
  FaHandshake,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./LandingPage.css";
import FarmImage from "../../assets/farming.jpg";
import LoginPopup from "./LoginPopup";
import SignupModal from "./SignupModal";

const LandingPage = () => {
  const [activeSections, setActiveSections] = useState(["home"]);
  const [clickedSection, setClickedSection] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [signupStep, setSignupStep] = useState("role"); // 'role', 'farmer', 'collector', 'supplier', 'buyer'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [filePreviews, setFilePreviews] = useState({
    farmer: null,
    collector: null,
    supplier: null,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper to get payment placeholder
  const getPaymentPlaceholder = (method) => {
    switch (method) {
      case "esewa":
        return "Enter your E-sewa ID....";
      case "khalti":
        return "Enter your Khalti ID or Phone Number....";
      case "bank":
        return "Enter your Bank Account Number....";
      default:
        return "Enter gateway details....";
    }
  };

  const handleFileChange = (e, role) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreviews((prev) => ({ ...prev, [role]: previewUrl }));
    }
  };

  const removeFile = (e, role) => {
    e.preventDefault();
    e.stopPropagation();
    if (filePreviews[role]) {
      URL.revokeObjectURL(filePreviews[role]);
      setFilePreviews((prev) => ({ ...prev, [role]: null }));
    }
  };

  const toggleLoginPopup = () => {
    const newState = !showLoginPopup;
    setShowLoginPopup(newState);
    if (newState) {
      document.body.style.overflow = "hidden";
      if (showSignupPopup) {
        setShowSignupPopup(false);
        setSignupStep("role");
        setSelectedPaymentMethod("");
        Object.values(filePreviews).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        setFilePreviews({ farmer: null, collector: null, supplier: null });
      }
    } else {
      document.body.style.overflow = "unset";
    }
  };

  const toggleSignupPopup = () => {
    const newState = !showSignupPopup;
    setShowSignupPopup(newState);
    if (newState) {
      document.body.style.overflow = "hidden";
      setSignupStep("role");
      setSelectedPaymentMethod("");
      Object.values(filePreviews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      setFilePreviews({ farmer: null, collector: null, supplier: null });
      if (showLoginPopup) setShowLoginPopup(false);
    } else {
      document.body.style.overflow = "unset";
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (clickedSection) return;

      const sections = ["home", "about", "services", "contact"];
      const navbarHeight = 120;
      const viewportTop = window.scrollY + navbarHeight;
      const viewportBottom = window.scrollY + window.innerHeight - 100;

      const visible = [];

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (
            (offsetTop >= viewportTop && offsetTop <= viewportBottom) ||
            (offsetBottom >= viewportTop && offsetBottom <= viewportBottom) ||
            (offsetTop <= viewportTop && offsetBottom >= viewportBottom)
          ) {
            visible.push(section);
          }
        }
      });

      if (window.scrollY < 100) {
        setActiveSections(["home"]);
      } else if (visible.length > 0) {
        setActiveSections(visible);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [clickedSection]);

  const handleLinkClick = (section) => {
    setClickedSection(section);
    setActiveSections([section]);
    setIsMenuOpen(false);
    setTimeout(() => {
      setClickedSection(null);
    }, 1500);
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <a href="#home" className="logo">
          <span className="logo-icon">
            <FaLeaf />
          </span>
          <span>AgroMart</span>
        </a>

        {/* Desktop Navigation */}
        <ul className="nav-links desktop-nav">
          <li>
            <a
              href="#home"
              className={activeSections.includes("home") ? "active" : ""}
              onClick={() => handleLinkClick("home")}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#about"
              className={activeSections.includes("about") ? "active" : ""}
              onClick={() => handleLinkClick("about")}
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#services"
              className={activeSections.includes("services") ? "active" : ""}
              onClick={() => handleLinkClick("services")}
            >
              Services
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className={activeSections.includes("contact") ? "active" : ""}
              onClick={() => handleLinkClick("contact")}
            >
              Contact
            </a>
          </li>
        </ul>

        <div className="nav-buttons desktop-nav">
          <button className="btn-login" onClick={toggleLoginPopup}>
            Login
          </button>
          <button className="btn-signup" onClick={toggleSignupPopup}>
            Sign Up
          </button>
        </div>

        {/* Hamburger Menu Button */}
        <button
          className="hamburger-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
        <ul className="mobile-nav-links">
          <li>
            <a
              href="#home"
              className={activeSections.includes("home") ? "active" : ""}
              onClick={() => handleLinkClick("home")}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#about"
              className={activeSections.includes("about") ? "active" : ""}
              onClick={() => handleLinkClick("about")}
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#services"
              className={activeSections.includes("services") ? "active" : ""}
              onClick={() => handleLinkClick("services")}
            >
              Services
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className={activeSections.includes("contact") ? "active" : ""}
              onClick={() => handleLinkClick("contact")}
            >
              Contact
            </a>
          </li>
        </ul>
        <div className="mobile-nav-buttons">
          <button className="btn-login" onClick={toggleLoginPopup}>
            Login
          </button>
          <button className="btn-signup" onClick={toggleSignupPopup}>
            Sign Up
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="welcome-text">WELCOME TO</p>
          <h1>AGROMART</h1>
          <p className="hero-subtitle">Smarter, Faster, Agricultural Trading</p>
          <h2 className="hero-tagline">Grow Connection, Prosper Together !!</h2>
          <p className="hero-description">
            Connect farmers, suppliers, and buyers with AI-powered insights and
            seamless trading.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={toggleLoginPopup}>
              Login
            </button>
            <button className="btn-primary" onClick={toggleSignupPopup}>
              Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="about-header">
          <h2>About Agromart</h2>
          <p>
            Our Vision for a Smarter, More Efficient Agricultural Supply Chain
          </p>
        </div>
        <div className="about-content">
          <div className="about-text">
            <p>
              AgroMart is an AI-powered digital platform designed to connect
              farmers, collectors, suppliers, and buyers in a unified
              agricultural marketplace.
            </p>
            <p>
              It enables online trading of vegetables and fruits, reducing
              dependency on physical wholesale markets.
            </p>
            <p>
              The system supports efficient order management, transparent
              transactions, and real-time data access.
            </p>
            <p>
              AI-driven features such as demand and price insights help
              stakeholders make smarter business decisions.
            </p>
            <p>
              AgroMart aims to modernize the agricultural supply chain through
              technology, efficiency, and scalability.
            </p>
          </div>
          <div className="about-image">
            <img src={FarmImage} alt="Fresh vegetables in basket" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <div className="services-header">
          <h2>Our Premium Services</h2>
          <p>Empowering agricultural trade with cutting-edge technology</p>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <FaChartLine />
            </div>
            <h3>AI-Powered Insights</h3>
            <p>
              Get real-time demand forecasting and price predictions powered by
              advanced AI algorithms.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <FaShippingFast />
            </div>
            <h3>Fast Delivery</h3>
            <p>
              Efficient logistics network ensuring fresh produce reaches buyers
              quickly and safely.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <FaUserShield />
            </div>
            <h3>Secure Transactions</h3>
            <p>
              Bank-grade security with transparent payment gateways for
              worry-free trading.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <FaMobileAlt />
            </div>
            <h3>Mobile Access</h3>
            <p>
              Trade anywhere, anytime with our responsive platform accessible on
              all devices.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <FaDatabase />
            </div>
            <h3>Real-Time Data</h3>
            <p>
              Access live market data, inventory levels, and order tracking in
              real-time.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <FaHandshake />
            </div>
            <h3>Direct Connect</h3>
            <p>
              Connect directly with farmers, suppliers, and buyers without
              intermediaries.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon">
                <FaLeaf />
              </span>
              <span>AgroMart</span>
            </div>
            <p>
              Connecting farms to families, sustainably. AgroMart is dedicated
              to fresh, local produce and a thriving agricultural community.
            </p>
            <div className="social-links">
              <FaFacebookF className="social-icon" />
              <FaTwitter className="social-icon" />
              <FaInstagram className="social-icon" />
              <FaLinkedinIn className="social-icon" />
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contact</h3>
            <div className="contact-info">
              <p>Address: Pokhara, Kaski, Nepal</p>
              <p>Phone Number: 9800000000</p>
              <p>Email: info@agromart.com</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2028 AgroMart. All rights reserved.</p>
        </div>
      </footer>

      {/* Login Popup */}
      {showLoginPopup && (
        <LoginPopup
          toggleLoginPopup={toggleLoginPopup}
          toggleSignupPopup={toggleSignupPopup}
        />
      )}

      {/* Signup Modal */}
      <SignupModal
        showSignupPopup={showSignupPopup}
        toggleSignupPopup={toggleSignupPopup}
        signupStep={signupStep}
        setSignupStep={setSignupStep}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        getPaymentPlaceholder={getPaymentPlaceholder}
        filePreviews={filePreviews}
        setFilePreviews={setFilePreviews}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
      />
    </div>
  );
};

export default LandingPage;
