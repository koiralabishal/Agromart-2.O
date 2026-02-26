import React, { useMemo, useState, useRef } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";
import {
  FaRegCalendarAlt,
  FaFilter,
  FaDownload,
  FaLeaf,
  FaUsers,
  FaChartLine,
  FaChartBar,
  FaInbox,
  FaChartPie,
  FaShoppingCart,
  FaSpinner,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import "./Styles/DetailedAnalytics.css";

import { generateDualMonthAnalyticsPDF } from "../../../utils/analyticsExport.jsx";

const DetailedAnalytics = ({
  orders = { received: [] },
  wallet = {},
  walletData = null,
  products = [],
}) => {
  const [timeFilter, setTimeFilter] = useState("current"); // "current" or "last"
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef(null);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await generateDualMonthAnalyticsPDF(printRef, setTimeFilter, timeFilter);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let targetMonth, targetYear;
    if (timeFilter === "current") {
      targetMonth = currentMonth;
      targetYear = currentYear;
    } else {
      targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    }

    return (orders.received || []).filter((order) => {
      const d = new Date(order.createdAt);
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });
  }, [orders.received, timeFilter]);

  const orderList = filteredOrders;

  // 1. Process Sales Data (Daily Trend for filtered month)
  const salesData = useMemo(() => {
    const now = new Date();
    let targetMonth, targetYear;
    if (timeFilter === "current") {
      targetMonth = now.getMonth();
      targetYear = now.getFullYear();
    } else {
      targetMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      targetYear =
        now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    }

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      name: (i + 1).toString(),
      fruits: 0,
      vegetables: 0,
    }));

    orderList.forEach((order) => {
      const isPaid =
        order.paymentStatus === "Paid" || order.paymentStatus === "Completed";
      if (order.status !== "Delivered" || !isPaid) return;

      const day = new Date(order.createdAt).getDate();
      if (day > daysInMonth) return;

      order.products.forEach((item) => {
        const category = item.category
          ? item.category.toLowerCase()
          : "vegetables";
        if (category.includes("fruit")) {
          data[day - 1].fruits += item.quantity;
        } else {
          data[day - 1].vegetables += item.quantity;
        }
      });
    });
    return data;
  }, [orderList, timeFilter]);

  // 2. Process Demand Data (Bar Chart)
  const demandData = useMemo(() => {
    const productMap = {};
    orderList.forEach((order) => {
      if (order.status !== "Pending" && order.status !== "Delivered") return;

      order.products.forEach((item) => {
        productMap[item.productName] =
          (productMap[item.productName] || 0) + item.quantity;
      });
    });

    return Object.keys(productMap)
      .map((name) => ({ name, value: productMap[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [orderList]);

  // 3. Process Order Status Data (Pie Chart)
  const orderStatusData = useMemo(() => {
    let pending = 0;
    let active = 0;
    let delivered = 0;
    let canceled = 0;

    orderList.forEach((order) => {
      const s = order.status;
      if (s === "Delivered") delivered++;
      else if (s === "Canceled" || s === "Rejected") canceled++;
      else if (s === "Accepted" || s === "Processing" || s === "Shipping")
        active++;
      else pending++;
    });

    if (pending === 0 && active === 0 && delivered === 0 && canceled === 0)
      return [];

    return [
      { name: "Pending", value: pending, color: "#f39c12" },
      { name: "Active", value: active, color: "#3498db" },
      { name: "Delivered", value: delivered, color: "#2ecc71" },
      { name: "Canceled", value: canceled, color: "#e74c3c" },
    ];
  }, [orderList]);

  // 4. Calculate Statistics
  const stats = useMemo(() => {
    const finalizedOrders = orderList.filter(
      (o) =>
        o.status === "Delivered" &&
        (o.paymentStatus === "Paid" || o.paymentStatus === "Completed"),
    );

    const totalRevenue = finalizedOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );

    const totalProductsSold = finalizedOrders.reduce((acc, order) => {
      return acc + order.products.reduce((sum, p) => sum + p.quantity, 0);
    }, 0);

    const uniqueCustomers = new Set(
      orderList.map((o) => o.buyerID?._id || o.buyerID),
    ).size;
    const avgOrderValue =
      finalizedOrders.length > 0
        ? (totalRevenue / finalizedOrders.length).toFixed(2)
        : 0;

    const currentMonthName = new Date().toLocaleString("default", {
      month: "long",
    });
    const lastMonthName = new Date(
      new Date().setMonth(new Date().getMonth() - 1),
    ).toLocaleString("default", { month: "long" });
    const periodName =
      timeFilter === "current" ? currentMonthName : lastMonthName;

    return [
      {
        title: "Total Revenues",
        value: `Rs. ${totalRevenue.toLocaleString()}`,
        subtitle: `${periodName} Earnings`,
        icon: <TbCurrencyRupeeNepalese />,
        color: "#1dc956",
      },
      {
        title: "Products Sold",
        value: `${totalProductsSold.toLocaleString()}`,
        subtitle: `${periodName} Units`,
        icon: <FaLeaf />,
        color: "#1dc956",
      },
      {
        title: "Unique Buyers",
        value: `${uniqueCustomers}`,
        subtitle: `${periodName} Customers`,
        icon: <FaUsers />,
        color: "#1dc956",
      },
      {
        title: "Avg Order Value",
        value: `Rs. ${Number(avgOrderValue).toLocaleString()}`,
        subtitle: `Approx. per order (${periodName})`,
        icon: <FaChartLine />,
        color: "#1dc956",
      },
    ];
  }, [orderList, wallet, walletData]);

  return (
    <div className="detailed-analytics" ref={printRef}>
      <div className="da-header" data-html2canvas-ignore>
        <h1>Analytics Overview</h1>
        <div className="da-actions">
          <button
            className={`da-btn ${timeFilter === "current" ? "da-green active" : "da-white"}`}
            onClick={() => setTimeFilter("current")}
          >
            <FaRegCalendarAlt /> Current Month
          </button>
          <button
            className={`da-btn ${timeFilter === "last" ? "da-green active" : "da-white"}`}
            onClick={() => setTimeFilter("last")}
          >
            <FaRegCalendarAlt /> Last Month
          </button>
          <button 
            className="da-btn da-white" 
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? <FaSpinner className="spin" /> : <FaDownload />} 
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="da-stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="da-stat-card"
            style={{ background: stat.color }}
          >
            <div className="da-stat-info">
              <span className="da-stat-title">{stat.title}</span>
              <h2 className="da-stat-value">{stat.value}</h2>
              <span className="da-stat-change">{stat.subtitle}</span>
            </div>
            <div className="da-stat-icon-wrapper">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="da-charts-main-row">
        <div className="da-chart-box large-chart">
          <div className="da-chart-header">
            <h3>Sales Trend</h3>
            <p>Monthly distribution of Produce</p>
          </div>
          <div style={{ width: "100%", height: 350 }}>
            {salesData.some((d) => d.fruits > 0 || d.vegetables > 0) ? (
              <ResponsiveContainer>
                <LineChart
                  data={salesData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    height={50}
                  >
                    <Label
                      value="Day of Month"
                      offset={0}
                      position="insideBottom"
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        fill: "#4a5568",
                      }}
                    />
                  </XAxis>
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    width={60}
                  >
                    <Label
                      value="Quantity"
                      angle={-90}
                      position="insideLeft"
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        fill: "#4a5568",
                        textAnchor: "middle",
                      }}
                    />
                  </YAxis>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="vegetables"
                    stroke="#1dc956"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fruits"
                    stroke="#f1c40f"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="da-empty-chart">
                <FaChartLine size={40} style={{ marginBottom: "1rem" }} />
                <span>No sales trend data for this period</span>
              </div>
            )}
          </div>
        </div>

        <div className="da-chart-box side-chart">
          <div className="da-chart-header">
            <h3>Order Status</h3>
            <p>Overall distribution</p>
          </div>
          <div style={{ width: "100%", height: 350 }}>
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="da-empty-chart">
                <FaChartPie size={40} style={{ marginBottom: "1rem" }} />
                <span>No order distribution data</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Charts Row */}
      <div className="da-charts-bottom-row">
        <div className="da-chart-box full-chart">
          <div className="da-chart-header">
            <h3>Top Demand Products</h3>
            <p>Top performing listings by quantity sold/pending</p>
          </div>
          <div className="da-demand-chart-container">
            {demandData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  layout="vertical"
                  data={demandData}
                  margin={{ top: 20, right: 40, left: 100, bottom: 20 }}
                  barCategoryGap="15%"
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    horizontal={true}
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                  >
                    <Label
                      value="Quantity Sold"
                      offset={-10}
                      position="insideBottom"
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        fill: "#4a5568",
                      }}
                    />
                  </XAxis>
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#4a5568", fontWeight: "500" }}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8f8f8" }}
                    contentStyle={{ borderRadius: "12px", border: "none" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#1dc956"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="da-empty-chart">
                <FaShoppingCart size={40} style={{ marginBottom: "1rem" }} />
                <span>No product demand data found</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalytics;
