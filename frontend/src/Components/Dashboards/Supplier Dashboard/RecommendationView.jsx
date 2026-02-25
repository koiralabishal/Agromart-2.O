import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaArrowRight,
  FaCalendarAlt,
  FaLeaf,
  FaInfoCircle,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import api from "../../../api/axiosConfig";
import "./Styles/DetailedAnalytics.css"; // Reuse analytics styles for consistency

const RecommendationView = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await api.get("/forecast");
        setForecastData(response.data);
      } catch (err) {
        console.error("Error fetching forecast:", err);
        setError("Failed to load forecast data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="da-empty-chart">
        <div className="loading-spinner"></div>
        <p>Loading market recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="da-empty-chart">
        <FaInfoCircle size={40} color="#e74c3c" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="detailed-analytics">
      <div className="da-header">
        <h1>Market Price Recommendations</h1>
        <p>AI-powered 7-day price forecast based on market trends.</p>
      </div>

      <div className="da-charts-full-row">
        <div className="da-chart-box">
          <div className="da-chart-header">
            <h3>Price Forecast (Next 7 Days)</h3>
            <p>Anticipated price fluctuations to help you plan your sales.</p>
          </div>

          <div className="recommendation-grid">
            {forecastData.map((item, index) => (
              <div key={index} className="recommendation-card">
                <div className="rec-veg-header">
                  <FaLeaf className="leaf-icon" />
                  <h4>{item.vegetable}</h4>
                </div>
                <div className="rec-table-wrapper">
                  <table className="rec-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Predicted Price</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.forecast.map((day, dIdx) => {
                        const prevPrice = dIdx > 0 ? item.forecast[dIdx - 1].price : null;
                        const isUp = prevPrice !== null && day.price > prevPrice;
                        const isDown = prevPrice !== null && day.price < prevPrice;

                        return (
                          <tr key={dIdx}>
                            <td>
                              <FaCalendarAlt className="date-icon" />
                              {new Date(day.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="price-cell">
                              <TbCurrencyRupeeNepalese />
                              {day.price.toFixed(2)}
                            </td>
                            <td>
                              {isUp && <span className="trend-up">▲</span>}
                              {isDown && <span className="trend-down">▼</span>}
                              {!isUp && !isDown && <span className="trend-stable">-</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .recommendation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .recommendation-card {
          background: #fff;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #edf2f7;
        }
        .rec-veg-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 0.5rem;
        }
        .leaf-icon {
          color: #1dc956;
          font-size: 1.2rem;
        }
        .rec-veg-header h4 {
          margin: 0;
          color: #2d3748;
          font-size: 1.1rem;
        }
        .rec-table-wrapper {
          overflow-x: auto;
        }
        .rec-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .rec-table th {
          text-align: left;
          color: #718096;
          font-weight: 600;
          padding: 0.5rem;
          border-bottom: 2px solid #edf2f7;
        }
        .rec-table td {
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid #f7fafc;
          color: #4a5568;
        }
        .price-cell {
          font-weight: 600;
          color: #2d3748;
          display: flex;
          align-items: center;
        }
        .date-icon {
          margin-right: 0.5rem;
          color: #a0aec0;
          font-size: 0.8rem;
        }
        .trend-up {
          color: #38a169;
          font-weight: bold;
        }
        .trend-down {
          color: #e53e3e;
          font-weight: bold;
        }
        .trend-stable {
          color: #a0aec0;
        }
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1dc956;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RecommendationView;
