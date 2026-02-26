import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaLeaf,
  FaSearch,
  FaChevronRight,
  FaDotCircle,
} from "react-icons/fa";
import {
  TbCurrencyRupeeNepalese,
  TbReportMoney,
  TbChartBar,
} from "react-icons/tb";
import api from "../../api/axiosConfig";
import "./Styles/RecommendedPricePopup.css";

const RecommendedPricePopup = ({ isOpen, onClose, onConfirm, productName }) => {
  const [allForecasts, setAllForecasts] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customPrice, setCustomPrice] = useState("");
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const fetchForecast = async () => {
        setLoading(true);
        try {
          const response = await api.get("/forecast");
          const data = response.data;
          setAllForecasts(data);

          if (productName) {
            findMatch(data, productName);
          } else {
            setForecast(null);
          }
        } catch (err) {
          console.error("Error fetching forecast:", err);
          setError("Failed to load recommendation data.");
        } finally {
          setLoading(false);
        }
      };

      fetchForecast();
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && allForecasts.length > 0) {
      findMatch(allForecasts, productName);
    }
  }, [productName, allForecasts, isOpen]);

  const findMatch = (data, name) => {
    if (!name) {
      setForecast(null);
      return;
    }

    let match = data.find(
      (f) => f.vegetable.toLowerCase() === name.toLowerCase(),
    );

    if (!match) {
      match = data.find(
        (f) =>
          f.vegetable.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(f.vegetable.toLowerCase()),
      );
    }
    setForecast(match);
  };

  const handleConfirm = (price) => {
    onConfirm(price);
  };

  const filteredItems = allForecasts.filter((f) =>
    f.vegetable.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="rpp-modern-overlay" onClick={onClose}>
      <div
        className="rpp-modern-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Futuristic Background Accents */}
        <div className="rpp-bg-blob blob-1"></div>
        <div className="rpp-bg-blob blob-2"></div>

        <div className="rpp-modern-header">
          <div className="rpp-brand">
            <div className="rpp-brand-logo">
              <FaLeaf />
            </div>
            <div className="rpp-brand-text">
              <span className="brand-main">AgroMart</span>
              <span className="brand-sub">Smart Pricing AI</span>
            </div>
          </div>
          <button className="rpp-close-btn" onClick={onClose}>
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="rpp-modern-body">
          <div className="rpp-body-header">
            <h1>Market Recommendations</h1>
            <p>AI-driven price forecasts based on real-time market data.</p>
          </div>

          <div className="rpp-main-grid">
            {/* Left Column: Forecast or Selection */}
            <div className="rpp-view-column">
              {loading ? (
                <div className="rpp-modern-loader">
                  <div className="loader-orbit">
                    <div className="loader-planet"></div>
                  </div>
                  <p>Analyzing Market Waves...</p>
                </div>
              ) : forecast ? (
                <div className="rpp-forecast-view animate-fade-in">
                  <div className="rpp-item-header-card">
                    <div className="item-icon-box">
                      <TbChartBar />
                    </div>
                    <div className="item-details">
                      <h3>{forecast.vegetable}</h3>
                      <span className="v-status">
                        <FaDotCircle /> Active Trend
                      </span>
                    </div>
                    <button
                      className="change-item-btn"
                      onClick={() => setForecast(null)}
                    >
                      Switch Item
                    </button>
                  </div>

                  <div className="rpp-forecast-list">
                    {forecast.forecast.map((day, idx) => {
                      const prevPrice =
                        idx > 0 ? forecast.forecast[idx - 1].price : null;
                      const isUp = prevPrice !== null && day.price > prevPrice;
                      const isDown =
                        prevPrice !== null && day.price < prevPrice;

                      return (
                        <div key={idx} className="rpp-forecast-card">
                          <div className="fc-date">
                            <span className="fc-day">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </span>
                            <span className="fc-full-date">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="fc-price">
                            <TbCurrencyRupeeNepalese className="price-unit" />
                            <span className="price-val">
                              {day.price.toFixed(0)}
                            </span>
                            <span className="price-dec">
                              .{day.price.toFixed(2).split(".")[1]}
                            </span>
                          </div>
                          <div
                            className={`fc-trend ${isUp ? "trend-up" : isDown ? "trend-down" : "trend-stable"}`}
                          >
                            {isUp && (
                              <>
                                <span className="t-icon">▲</span>{" "}
                                <span className="t-text">Up</span>
                              </>
                            )}
                            {isDown && (
                              <>
                                <span className="t-icon">▼</span>{" "}
                                <span className="t-text">Down</span>
                              </>
                            )}
                            {!isUp && !isDown && (
                              <>
                                <span className="t-icon">-</span>{" "}
                                <span className="t-text">Flat</span>
                              </>
                            )}
                          </div>
                          <button
                            className="fc-set-btn"
                            onClick={() => handleConfirm(day.price.toFixed(2))}
                          >
                            Set This Price
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rpp-selector-view animate-fade-in">
                  <div className="rpp-modern-search">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search 20 commodities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="rpp-selection-grid">
                    {filteredItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="rpp-select-card"
                        onClick={() => setForecast(item)}
                      >
                        <div className="sc-icon">
                          <FaLeaf />
                        </div>
                        <div className="sc-info">
                          <span className="sc-name">{item.vegetable}</span>
                          <span className="sc-hint">Click to see forecast</span>
                        </div>
                        <FaChevronRight className="sc-arrow" />
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="no-items-state">
                        <p>No commodities matching "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                  {productName && !forecast && !searchTerm && (
                    <div className="rpp-fallback-alert">
                      <p>
                        We don't have a direct forecast for{" "}
                        <strong>"{productName}"</strong>. Please select the most
                        similar item from the list above.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Custom Price & Summary */}
            <div className="rpp-action-column">
              <div className="rpp-premium-card custom-price-card">
                <div className="card-top">
                  <TbReportMoney className="card-icon" />
                  <h4>Manual Pricing</h4>
                </div>
                <p className="card-desc">
                  Set your own price if market predictions don't match your
                  quality.
                </p>

                <div className="premium-input-group">
                  <div className="pi-wrapper">
                    <TbCurrencyRupeeNepalese className="pi-unit" />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                    />
                  </div>
                  <button
                    className="pi-button"
                    onClick={() => customPrice && handleConfirm(customPrice)}
                    disabled={!customPrice}
                  >
                    Apply Custom Price
                  </button>
                </div>
              </div>

              <div className="rpp-trust-card">
                <div className="trust-icon-box">🛡️</div>
                <div className="trust-content">
                  <h5>Trusted Prediction</h5>
                  <p>
                    AgroMart AI analyzes historical trends from Kalimati Market
                    to give you the most accurate price recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rpp-modern-footer">
          <p>
            © {new Date().getFullYear()} AgroMart Intelligence System. All data
            is indicative of market trends.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecommendedPricePopup;
