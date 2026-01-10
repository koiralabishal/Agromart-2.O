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
  FaDollarSign,
  FaLeaf,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import "./Styles/DetailedAnalytics.css";

const DetailedAnalytics = () => {
  // Mock Data for Charts (Synchronized with FarmerDashboard.jsx)
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
    { name: "Oranges", value: 300 },
    { name: "Carrots", value: 280 },
    { name: "Spinach", value: 250 },
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

  return (
    <div className="detailed-analytics">
      <div className="da-header">
        <h1>Detailed Analytics</h1>
        <div className="da-actions">
          <button className="da-btn da-white">
            <FaRegCalendarAlt /> Last 30 Days
          </button>
          <button className="da-btn da-white">
            <FaFilter /> Metric: Quantity
          </button>
          <button className="da-btn da-green">
            <FaDownload /> Export Data
          </button>
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
        {/* Sales Trend Chart - Synchronized with FarmerDashboard */}
        <div className="da-chart-box">
          <div className="da-chart-title">Monthly Sales Trend</div>
          <div className="da-chart-subtitle">
            Sales quantity of Fruits vs. Vegetables.
          </div>
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <LineChart
                data={salesData}
                margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={true}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  label={{
                    value: "Month",
                    position: "insideBottom",
                    offset: -10,
                    fill: "#666",
                    fontSize: 12,
                  }}
                />
                <YAxis
                  axisLine={true}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  label={{
                    value: "Quantity",
                    angle: -90,
                    position: "insideLeft",
                    offset: 0,
                    fill: "#666",
                    fontSize: 12,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ marginBottom: -30, marginLeft: 31 }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ marginRight: 10 }}>{value === "fruits" ? "Fruits" : "Vegetables"}</span>
                  )}
                />

                <Line
                  type="monotone"
                  dataKey="fruits"
                  name="Fruits"
                  stroke="#F5A623"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="vegetables"
                  name="Vegetables"
                  stroke="#1DC956"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand Products Chart - Synchronized with FarmerDashboard */}
        <div className="da-chart-box">
          <div className="da-chart-title">Highest Demand Products</div>
          <div className="da-chart-subtitle">
            Top demanded vegetables and fruits by quantity.
          </div>
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={demandData}
                margin={{ top: 5, right: 30, left: 10, bottom: 30 }}
              >
                <XAxis
                  type="number"
                  axisLine={true}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  label={{
                    value: "Quantity",
                    position: "insideBottom",
                    offset: -10,
                    fill: "#666",
                    fontSize: 12,
                  }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#555", fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#1DC956"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalytics;
