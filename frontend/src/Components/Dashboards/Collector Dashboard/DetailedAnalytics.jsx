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
  LabelList,
} from "recharts";
import {
  FaRegCalendarAlt,
  FaFilter,
  FaDownload,
  FaLeaf,
  FaUsers,
  FaChartLine,
  FaChartBar,
  FaShoppingCart,
  FaChartPie,
  FaShoppingBag,
  FaSpinner,
} from "react-icons/fa";
import { TbCurrencyRupeeNepalese } from "react-icons/tb";
import "./Styles/DetailedAnalytics.css";

import { generateDualMonthAnalyticsPDF } from "../../../utils/analyticsExport.jsx";

const DetailedAnalytics = ({
  orders = { received: [], placed: [] },
  wallet = {},
  walletData = null,
  products: farmers = [],
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
  const activeFarmersCount = farmers?.length || 0;

  // Filter logic for monthly analytics
  const filterOrdersByMonth = (orderList) => {
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

    return (orderList || []).filter((order) => {
      const d = new Date(order.createdAt);
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });
  };

  const filteredReceived = useMemo(
    () => filterOrdersByMonth(orders.received),
    [orders.received, timeFilter],
  );
  const filteredPlaced = useMemo(
    () => filterOrdersByMonth(orders.placed),
    [orders.placed, timeFilter],
  );

  // Helper for Daily Trend Logic
  const getDailyTrendData = (orderList, isReviewingOrders = false) => {
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
      // For Sales (Received): Must be Delivered & Paid
      // For Purchases (Placed): Must be Delivered
      const isValid =
        order.status === "Delivered" &&
        (isReviewingOrders
          ? true
          : order.paymentStatus === "Paid" ||
            order.paymentStatus === "Completed");

      if (!isValid) return;

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
  };

  // 1. Sales Trend (Sold to Buyers)
  const salesTrendData = useMemo(
    () => getDailyTrendData(filteredReceived, false),
    [filteredReceived, timeFilter],
  );

  // 2. Purchase Trend (Bought from Farmers)
  const purchaseTrendData = useMemo(
    () => getDailyTrendData(filteredPlaced, true),
    [filteredPlaced, timeFilter],
  );


  // Helper for Top Sales Products (Delivered + Paid only)
  const getTopSalesData = (orderList) => {
    const productMap = {};
    orderList.forEach((order) => {
      // Only count Delivered orders with Paid/Completed payment
      if (
        order.status !== "Delivered" ||
        (order.paymentStatus !== "Paid" && order.paymentStatus !== "Completed")
      )
        return;
      order.products.forEach((item) => {
        productMap[item.productName] =
          (productMap[item.productName] || 0) + item.quantity;
      });
    });
    return Object.keys(productMap)
      .map((name) => ({ name, value: productMap[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Helper for Top Purchase Products (Delivered only)
  const getTopPurchaseData = (orderList) => {
    const productMap = {};
    orderList.forEach((order) => {
      // Only count Delivered orders
      if (order.status !== "Delivered") return;
      order.products.forEach((item) => {
        productMap[item.productName] =
          (productMap[item.productName] || 0) + item.quantity;
      });
    });
    return Object.keys(productMap)
      .map((name) => ({ name, value: productMap[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // 3. Top Sales Products
  const topSalesData = useMemo(
    () => getTopSalesData(filteredReceived),
    [filteredReceived],
  );
  // 4. Top Purchase Products
  const topPurchaseData = useMemo(
    () => getTopPurchaseData(filteredPlaced),
    [filteredPlaced],
  );

  // 5. Unified Order Status (Placed + Received)
  const orderStatusData = useMemo(() => {
    let pending = 0;
    let active = 0;
    let delivered = 0;
    let canceled = 0;

    const countStatus = (list) => {
      list.forEach((order) => {
        const s = order.status;
        if (s === "Delivered") delivered++;
        else if (s === "Canceled" || s === "Rejected") canceled++;
        else if (s === "Accepted" || s === "Processing" || s === "Shipping")
          active++;
        else pending++;
      });
    };

    countStatus(filteredReceived);
    countStatus(filteredPlaced);

    if (pending === 0 && active === 0 && delivered === 0 && canceled === 0)
      return [];

    return [
      { name: "Pending", value: pending, color: "#f39c12" },
      { name: "Active", value: active, color: "#3498db" },
      { name: "Delivered", value: delivered, color: "#1dc956" },
      { name: "Canceled", value: canceled, color: "#e74c3c" },
    ];
  }, [filteredReceived, filteredPlaced]);

  // 6. Statistics Calculation
  const stats = useMemo(() => {
    // Sales Logic
    const finalSales = filteredReceived.filter(
      (o) =>
        o.status === "Delivered" &&
        (o.paymentStatus === "Paid" || o.paymentStatus === "Completed"),
    );
    const totalRevenue = finalSales.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );

    const totalProductsSold = finalSales.reduce((acc, order) => {
      return acc + order.products.reduce((sum, p) => sum + p.quantity, 0);
    }, 0);

    // Purchases Logic
    const finalPurchases = filteredPlaced.filter(
      (o) => o.status === "Delivered",
    ); // Considering delivered as purchased
    const totalPurchases = finalPurchases.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );
    const itemPurchases = finalPurchases.reduce(
      (acc, order) =>
        acc + order.products.reduce((sum, p) => sum + p.quantity, 0),
      0,
    );

    // Unique Buyers Logic (From Delivered + Paid Sales only)
    const uniqueBuyers = new Set(
      finalSales.map((o) => o.buyerID?._id || o.buyerID),
    ).size;

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
        title: "Total Sales",
        value: `Rs. ${totalRevenue.toLocaleString()}`,
        subtitle: `${periodName} Revenue`,
        icon: <TbCurrencyRupeeNepalese />,
        color: "#1dc956",
      },
      {
        title: "Items Sold",
        value: `${totalProductsSold.toLocaleString()}`,
        subtitle: `${periodName} Units`,
        icon: <FaLeaf />,
        color: "#1dc956",
      },
      {
        title: "Total Purchases",
        value: `Rs. ${totalPurchases.toLocaleString()}`,
        subtitle: `${periodName} Spend`,
        icon: <FaShoppingBag />,
        color: "#1dc956",
      },
      {
        title: "Item Purchases",
        value: `${itemPurchases.toLocaleString()}`,
        subtitle: "Units Bought",
        icon: <FaShoppingCart />,
        color: "#1dc956",
      },
      {
        title: "Unique Buyers",
        value: `${uniqueBuyers}`,
        subtitle: "Active Customers",
        icon: <FaUsers />,
        color: "#1dc956",
      },
    ];
  }, [filteredReceived, filteredPlaced, timeFilter]);

  return (
    <div className="detailed-analytics" ref={printRef}>
      <div className="da-header" data-html2canvas-ignore>
        <h1>Detailed Analytics</h1>
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

      {/* Row 1: Sales Trend + Combined Pie Chart */}
      <div className="da-charts-main-row">
        <div className="da-chart-box large-chart">
          <div className="da-chart-header">
            <h3>Daily Sales Trend</h3>
            <p>Sales distribution (Sold to Buyers) for the selected month</p>
          </div>
          <div style={{ width: "100%", height: 400 }}>
            {salesTrendData.some((d) => d.fruits > 0 || d.vegetables > 0) ? (
              <ResponsiveContainer>
                <LineChart
                  data={salesTrendData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
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
                      value="Day"
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
                    allowDecimals={false}
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
                    name="Vegetables"
                    stroke="#1dc956"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fruits"
                    name="Fruits"
                    stroke="#f1c40f"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="da-empty-chart">
                <FaChartLine size={40} style={{ marginBottom: "1rem" }} />
                <span>No sales data for this period</span>
              </div>
            )}
          </div>
        </div>

        <div className="da-chart-box side-chart">
          <div className="da-chart-header">
            <h3>Order Status</h3>
            <p>Overall (Sales & Purchases)</p>
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
                <span>No order data found</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Purchase Trend (Full Width or Split) - Keeping structure standard */}
      <div className="da-charts-full-row">
        <div className="da-chart-box">
          <div className="da-chart-header">
            <h3>Daily Purchase Trend</h3>
            <p>
              Purchase distribution (Bought from Farmers) for the selected month
            </p>
          </div>
          <div style={{ width: "100%", height: 400 }}>
            {purchaseTrendData.some((d) => d.fruits > 0 || d.vegetables > 0) ? (
              <ResponsiveContainer>
                <LineChart
                  data={purchaseTrendData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
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
                      value="Day"
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
                    allowDecimals={false}
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
                    name="Vegetables"
                    stroke="#3498db"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fruits"
                    name="Fruits"
                    stroke="#e67e22"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="da-empty-chart">
                <FaShoppingBag size={40} style={{ marginBottom: "1rem" }} />
                <span>No purchase data for this period</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Top Sales & Top Purchases (Side by Side) */}
      <div className="da-charts-dual-row">
        {/* Top Sales */}
        <div className="da-chart-box">
          <div className="da-chart-header">
            <h3>Top Products Sold</h3>
            <p>Highest quantity sold to buyers</p>
          </div>
          <div className="da-demand-chart-container">
            {topSalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  layout="vertical"
                  data={topSalesData}
                  margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
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
                    axisLine={true}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#666" }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#4a5568", fontWeight: "600" }}
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
                    barSize={20}
                  >
                    <LabelList
                      dataKey="value"
                      position="right"
                      fill="#666"
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="da-empty-chart">
                <FaLeaf size={32} style={{ marginBottom: "1rem" }} />
                <span>No sales data</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Purchases */}
        <div className="da-chart-box">
          <div className="da-chart-header">
            <h3>Top Products Purchased</h3>
            <p>Highest quantity bought from farmers</p>
          </div>
          <div className="da-demand-chart-container">
            {topPurchaseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  layout="vertical"
                  data={topPurchaseData}
                  margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
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
                    axisLine={true}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#666" }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#4a5568", fontWeight: "600" }}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8f8f8" }}
                    contentStyle={{ borderRadius: "12px", border: "none" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3498db"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  >
                    <LabelList
                      dataKey="value"
                      position="right"
                      fill="#666"
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="da-empty-chart">
                <FaShoppingBag size={32} style={{ marginBottom: "1rem" }} />
                <span>No purchase data</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DetailedAnalytics;
