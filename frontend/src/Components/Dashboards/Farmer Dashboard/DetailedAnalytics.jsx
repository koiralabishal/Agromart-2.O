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

const DetailedAnalytics = ({
  orders = [],
  wallet = {},
  walletData = null,
  products = [],
}) => {
  // Processor functions (same logic as FarmerDashboard for consistency)
  const processSalesData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const data = months.map((name) => ({
      name,
      fruits: 0,
      vegetables: 0,
    }));

    orders.forEach((order) => {
      // User requested: line graph only show fruits and vegetables that are successfully delivered AND paid
      if (order.status !== "Delivered" || order.paymentStatus !== "Paid")
        return;

      const date = new Date(order.createdAt);
      const monthIndex = date.getMonth();

      order.products.forEach((item) => {
        const category = item.category
          ? item.category.toLowerCase()
          : "vegetables";
        if (category.includes("fruit")) {
          data[monthIndex].fruits += item.quantity;
        } else {
          data[monthIndex].vegetables += item.quantity;
        }
      });
    });

    return data;
  };

  const processDemandData = () => {
    const productMap = {};
    orders.forEach((order) => {
      // User requested: High demand includes Pending and Delivered status
      if (order.status !== "Pending" && order.status !== "Delivered") return;

      order.products.forEach((item) => {
        if (productMap[item.productName]) {
          productMap[item.productName] += item.quantity;
        } else {
          productMap[item.productName] = item.quantity;
        }
      });
    });

    return Object.keys(productMap)
      .map((name) => ({ name, value: productMap[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const salesData = processSalesData();
  const demandData = processDemandData();

  // Calculate Statistics
  const totalOnlineRevenue = Number(
    wallet?.totalEarnings || wallet?.totalRevenue || 0,
  );

  const totalCODEarnings = walletData?.codTransactions
    ? walletData.codTransactions
        .filter((t) => t.type === "Credit" && t.status === "Completed")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    : 0;

  const totalRevenue = totalOnlineRevenue + totalCODEarnings;

  // Products Sold should only count Delivered AND Paid orders per user request
  const finalizedOrders = orders.filter(
    (o) => o.status === "Delivered" && o.paymentStatus === "Paid",
  );

  const totalProductsSold = finalizedOrders.reduce((acc, order) => {
    return acc + order.products.reduce((sum, p) => sum + p.quantity, 0);
  }, 0);

  const uniqueCustomers = new Set(
    orders.map((o) => o.buyerID?._id || o.buyerID),
  ).size;

  const averageOrderValue =
    finalizedOrders.length > 0
      ? (totalRevenue / finalizedOrders.length).toFixed(2)
      : 0;

  const stats = [
    {
      title: "Total Revenues",
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      change: "Lifetime Earnings (Online + COD)",
      icon: <TbCurrencyRupeeNepalese />,
    },
    {
      title: "Products Sold",
      value: `${totalProductsSold.toLocaleString()} units`,
      change: "Total volume sold",
      icon: <FaLeaf />,
    },
    {
      title: "Unique Buyers",
      value: uniqueCustomers,
      change: "Customer base size",
      icon: <FaUsers />,
    },
    {
      title: "Average Order Value",
      value: `Rs. ${Number(averageOrderValue).toLocaleString()}`,
      change: "Revenue per order (approx.)",
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
                    <span style={{ marginRight: 10 }}>{value}</span>
                  )}
                />

                <Line
                  type="monotone"
                  dataKey="vegetables"
                  name="Vegetables"
                  stroke="#1dc956"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="fruits"
                  name="Fruits"
                  stroke="#f1c40f"
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
