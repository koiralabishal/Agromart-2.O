import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaRegCalendarAlt,
  FaFilter,
  FaDownload,
  FaLeaf,
  FaUsers,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaDatabase,
  FaBullseye,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import "./Styles/DetailedAnalytics.css";
import Pagination from "../../Common/Pagination";


const DetailedAnalytics = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const salesData = [
    { name: "Jan", fruits: 400, vegetables: 240 },
    { name: "Feb", fruits: 300, vegetables: 139 },
    { name: "Mar", fruits: 200, vegetables: 980 },
    { name: "Apr", fruits: 278, vegetables: 390 },
    { name: "May", fruits: 189, vegetables: 480 },
    { name: "Jun", fruits: 239, vegetables: 380 },
    { name: "Jul", fruits: 349, vegetables: 430 },
    { name: "Aug", fruits: 200, vegetables: 500 },
    { name: "Sep", fruits: 278, vegetables: 390 },
    { name: "Oct", fruits: 189, vegetables: 480 },
    { name: "Nov", fruits: 239, vegetables: 380 },
    { name: "Dec", fruits: 349, vegetables: 430 },
  ];

  const demandData = [
    { name: "Tomatoes", value: 500 },
    { name: "Potatoes", value: 450 },
    { name: "Onions", value: 400 },
    { name: "Bell Peppers", value: 370 },
    { name: "Apples", value: 350 },
  ];

  const predictedDemandData = [
    { name: "Jan", value: 420 },
    { name: "Feb", value: 480 },
    { name: "Mar", value: 550 },
  ];

  const stats = [
    {
      title: "Total Sales Revenue",
      value: "Rs. 28,450",
      change: "+12.5% from last month",
      icon: <TbCurrencyRupeeNepalese />,
    },
    {
      title: "Products Sold",
      value: "7,890 units",
      change: "+8.1% from last month",
      icon: <FaLeaf />,
    },
    {
      title: "New Customers",
      value: "145",
      change: "+18% from last month",
      icon: <FaUsers />,
    },
    {
      title: "Average Order Value",
      value: "Rs. 1,200.50",
      change: "+3.2% from last month",
      icon: <FaChartLine />,
    },
  ];

  const predictions = [
    { title: "High Demand", value: "15", description: "Products predicted to sell rapidly.", color: "green", icon: <FaArrowUp /> },
    { title: "Average Demand", value: "30", description: "Products with stable, predictable sales.", color: "green", icon: <FaDatabase /> },
    { title: "Low Demand", value: "8", description: "Products requiring attention or promotion.", color: "red", icon: <FaArrowDown /> },
  ];

  const predictionList = [
    { name: "Tomatoes", quantity: 1200, confidence: "High", trend: "Up" },
    { name: "Apples", quantity: 1100, confidence: "Medium", trend: "Up" },
    { name: "Spinach", quantity: 800, confidence: "High", trend: "Up" },
    { name: "Potatoes", quantity: 950, confidence: "Medium", trend: "Down" },
    { name: "Oranges", quantity: 700, confidence: "Low", trend: "Down" },
    { name: "Carrots", quantity: 620, confidence: "High", trend: "Up" },
    { name: "Bananas", quantity: 550, confidence: "Medium", trend: "Down" },
  ];

  const paginatedPredictions = predictionList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="detailed-analytics">
      <div className="da-header">
        <h1>Detailed Analytics</h1>
        <div className="da-actions">
          <button className="da-btn da-white"><FaRegCalendarAlt /> Last 30 Days</button>
          <button className="da-btn da-white"><FaFilter /> Metric: Quantity</button>
          <button className="da-btn da-green"><FaDownload /> Export Data</button>
        </div>
      </div>

      <div className="da-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="da-stat-card">
            <div className="da-stat-info">
              <span className="da-stat-title">{stat.title}</span>
              <h2 className="da-stat-value">{stat.value}</h2>
              <span className="da-stat-change">{stat.change}</span>
            </div>
            <div className="da-stat-icon-wrapper">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="da-charts-container">
        <div className="da-chart-box">
          <div className="da-chart-title">Monthly Sales Trend</div>
          <div className="da-chart-subtitle">Sales quantity of Fruits vs. Vegetables.</div>
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={salesData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="fruits" name="Fruits" stroke="#F5A623" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="vegetables" name="Vegetables" stroke="#1DC956" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="da-chart-box">
          <div className="da-chart-title">Top 5 Product Demand</div>
          <div className="da-chart-subtitle">Top demanded vegetables and fruits by quantity.</div>
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart layout="vertical" data={demandData} margin={{ top: 5, right: 30, left: 10, bottom: 30 }}>
                <XAxis type="number" tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#555", fontSize: 12 }} width={100} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="value" fill="#1DC956" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Demand Prediction Section */}
      <div className="ai-prediction-section">
        <h2>AI Demand Prediction</h2>
        <div className="prediction-summary-grid">
           {predictions.map((p, i) => (
             <div key={i} className={`prediction-card ${p.color}`}>
                <div className="p-card-icon">{p.icon}</div>
                <div className="p-card-val">{p.value}</div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
             </div>
           ))}
        </div>

        <div className="prediction-chart-box">
           <div className="pc-header">
              <h3>Vegetables Predicted Demand (Next 3 Months)</h3>
              <p>Seasonal demand forecast.</p>
           </div>
           <div style={{ width: "100%", height: 300 }}>
             <ResponsiveContainer>
               <BarChart data={predictedDemandData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" />
                 <YAxis />
                 <Tooltip />
                 <Bar dataKey="value" fill="#1DC956" radius={[4, 4, 0, 0]} barSize={60} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="predicted-list-box">
           <h3>Predicted Products List</h3>
           <table className="prediction-table">
             <thead>
               <tr>
                 <th>Product Name</th>
                 <th>Predicted Quantity</th>
                 <th>Confidence Level</th>
                 <th>Trend</th>
               </tr>
             </thead>
             <tbody>
               {paginatedPredictions.map((item, i) => (
                 <tr key={i}>
                   <td>{item.name}</td>
                   <td>{item.quantity}</td>
                   <td>
                     <span className={`conf-badge ${item.confidence.toLowerCase()}`}>{item.confidence}</span>
                   </td>
                   <td>
                     <span className={`trend-badge ${item.trend.toLowerCase()}`}>
                       {item.trend === "Up" ? <FaArrowUp /> : <FaArrowDown />} {item.trend}
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
           {predictionList.length > itemsPerPage && (
             <Pagination
               currentPage={currentPage}
               totalItems={predictionList.length}
               itemsPerPage={itemsPerPage}
               onPageChange={(page) => setCurrentPage(page)}
             />
           )}
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalytics;
