import React from "react";
import {
  FaArrowUp,
  FaUsers,
  FaShoppingCart,
  FaChartLine,
  FaLeaf,
  FaAppleAlt,
  FaTruck,
  FaShoppingBag,
  FaBoxes,
  FaMoneyBillWave,
  FaGavel,
  FaBell,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminOverview = ({ stats }) => {
  const [growthFilter, setGrowthFilter] = React.useState("thisYear");
  const [revenueFilter, setRevenueFilter] = React.useState("thisYear");
  const [vegFilter, setVegFilter] = React.useState("thisYear");
  const [fruitFilter, setFruitFilter] = React.useState("thisYear");
  const [pipeFilter, setPipeFilter] = React.useState("thisYear");

  // Use real data from backend, fallback to empty array if loading
  const currentYearData = stats?.monthlyData || [];
  const previousYearData = stats?.previousMonthlyData || [];

  const userCompositionData = [
    { name: "Farmers", value: stats?.totalFarmers || 0, color: "#1DC956" },
    {
      name: "Collectors",
      value: stats?.totalCollectors || 0,
      color: "#3B82F6",
    },
    { name: "Suppliers", value: stats?.totalSuppliers || 0, color: "#F59E0B" },
    { name: "Buyers", value: stats?.totalBuyers || 0, color: "#EF4444" },
  ];

  // Use real activity data from stats API
  const getRecentActivity = () => stats?.recentActivity || [];

  // Helper to slice data dynamically based on filter
  const getFilteredData = (filterType) => {
    const currentMonthIndex = new Date().getMonth();
    // Use currentYearData directly from stats
    if (filterType === "thisYear") {
      return currentYearData.slice(0, currentMonthIndex + 1);
    } else {
      // Combine logic
      const combinedData = [...previousYearData, ...currentYearData];
      const combinedEndIndex = 12 + currentMonthIndex;
      const startIndex = Math.max(0, combinedEndIndex - 5);
      return combinedData.slice(startIndex, combinedEndIndex + 1);
    }
  };

  // Helper to format activity time relatively
  const formatActivityTime = (timestamp) => {
    const activityDate = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - activityDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const timeStr = activityDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffInDays === 0 && activityDate.getDate() === now.getDate()) {
      return `Today at ${timeStr}`;
    } else if (
      diffInDays <= 1 &&
      activityDate.getDate() === new Date(now - 86400000).getDate()
    ) {
      return `Yesterday at ${timeStr}`;
    } else {
      const dateStr = activityDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      return `${dateStr} at ${timeStr}`;
    }
  };

  // Common Dropdown Style
  const filterStyle = {
    padding: "0.3rem",
    borderRadius: "4px",
    border: "1px solid #E5E7EB",
    fontSize: "0.8rem",
    color: "#4B5563",
    marginLeft: "auto",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div className="admin-overview">
      <div className="ad-stats-grid">
        <div className="ad-stat-card ad-card-green">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Total Revenue</span>
            <FaChartLine className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">
            NPR {(stats?.totalRevenue || 0).toLocaleString()}
          </div>
          <div className="ad-stat-change">Delivered & Paid orders</div>
        </div>
        <div className="ad-stat-card ad-card-blue">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Total Orders</span>
            <FaShoppingCart className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">
            {stats?.totalOrders?.toLocaleString() || "0"}
          </div>
          <div className="ad-stat-change">Platform transaction volume</div>
        </div>
        <div className="ad-stat-card ad-card-yellow">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Total Users</span>
            <FaUsers className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">
            {stats?.totalUsers?.toLocaleString() || "0"}
          </div>
          <div className="ad-stat-change">
            Farmers, Collectors, Suppliers & Buyers
          </div>
        </div>
        <div className="ad-stat-card ad-card-red">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Growth Rate</span>
            <FaArrowUp className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">{stats?.userGrowthRate || "0"}%</div>
          <div className="ad-stat-change">Monthly active user growth</div>
        </div>
      </div>

      <div className="ad-category-stats">
        {userCompositionData.map((item, idx) => (
          <div
            key={idx}
            className={`ad-cat-card cat-${item.name.toLowerCase()}`}
          >
            <div className="ad-cat-icon-wrapper">
              <FaUsers />
            </div>
            <div className="ad-cat-info">
              <div className="ad-cat-title">{item.name}</div>
              <div className="ad-cat-val">{item.value}</div>
            </div>
          </div>
        ))}
        {/* Products Card */}
        <div className="ad-cat-card cat-products">
          <div className="ad-cat-icon-wrapper">
            <FaBoxes />
          </div>
          <div className="ad-cat-info">
            <div className="ad-cat-title">Products</div>
            <div className="ad-cat-val">
              {stats?.totalProducts?.toLocaleString() || "0"}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section 1: User Growth */}
      <div className="ad-charts-section">
        <div className="ad-chart-card">
          <div
            className="ad-chart-header"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className="ad-chart-title">User Growth Overview</div>
            <select
              value={growthFilter}
              onChange={(e) => setGrowthFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="thisYear">This Year</option>
              <option value="6Months">Last 6 Months</option>
            </select>
          </div>
          <div
            className="hide-scrollbar"
            style={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div style={{ minWidth: "600px", height: 300 }}>
              {getFilteredData(growthFilter).some(
                (d) =>
                  (d.Farmers > 0 ||
                    d.Collectors > 0 ||
                    d.Suppliers > 0 ||
                    d.Buyers > 0)
              ) ? (
                <ResponsiveContainer>
                  <BarChart
                    data={getFilteredData(growthFilter)}
                    barSize={30}
                    barGap={4}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      allowDecimals={false}
                      interval={0}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar
                      dataKey="Farmers"
                      fill="#1DC956"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Collectors"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Suppliers"
                      fill="#F59E0B"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Buyers"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="ad-empty-chart">
                  <FaChartLine size={40} />
                  <span>No user growth data available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ad-chart-card">
          <div className="ad-chart-header">
            <div className="ad-chart-title">Recent Activities</div>
          </div>
          <div className="ad-recent-activity hide-scrollbar">
            {getRecentActivity().length > 0 ? (
              getRecentActivity().map((activity, index) => {
                // Determine icon based on activity type
                let icon;
                if (activity.type.startsWith("USER_")) {
                  icon = <FaUsers />;
                } else if (activity.type.startsWith("ORDER_")) {
                  icon = <FaShoppingCart />;
                } else if (
                  activity.type.startsWith("PRODUCT_") ||
                  activity.type.startsWith("INVENTORY_")
                ) {
                  icon = <FaBoxes />;
                } else if (
                  activity.type.startsWith("WITHDRAWAL_") ||
                  activity.type.startsWith("WALLET_") ||
                  activity.type.startsWith("COD_")
                ) {
                  icon = <FaMoneyBillWave />;
                } else if (activity.type.startsWith("DISPUTE_")) {
                  icon = <FaGavel />;
                } else {
                  icon = <FaBell />;
                }

                return (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">{icon}</div>
                    <div className="activity-info">
                      <h4>{activity.message}</h4>
                      <p>{activity.detail}</p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#9CA3AF",
                          marginTop: "2px",
                        }}
                      >
                        {formatActivityTime(activity.time)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="ad-empty-chart"
                style={{ height: "auto", minHeight: "200px" }}
              >
                <FaBell size={40} />
                <span>No recent activities found</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demand/Supply Grid */}
      <div className="ad-ds-grid">
        <div className="ad-chart-card">
          <div
            className="ad-chart-header"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className="ad-chart-title">Demand vs Supply (Fruits)</div>
            <select
              value={fruitFilter}
              onChange={(e) => setFruitFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="thisYear">This Year</option>
              <option value="6Months">Last 6 Months</option>
            </select>
          </div>
          <div
            className="hide-scrollbar"
            style={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div style={{ minWidth: "500px", height: 200 }}>
              {getFilteredData(fruitFilter).some(
                (d) => d.DemandFruit > 0 || d.SupplyFruit > 0
              ) ? (
                <ResponsiveContainer>
                  <BarChart
                    data={getFilteredData(fruitFilter)}
                    barSize={30}
                    barGap={4}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      allowDecimals={false}
                      interval={0}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar
                      dataKey="DemandFruit"
                      name="Demand"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="SupplyFruit"
                      name="Supply"
                      fill="#F59E0B"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="ad-empty-chart">
                  <FaAppleAlt size={40} />
                  <span>No fruit data available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demand vs Supply (Vegetables) */}
        <div className="ad-chart-card">
          <div
            className="ad-chart-header"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className="ad-chart-title">Demand vs Supply (Vegetables)</div>
            <select
              value={vegFilter}
              onChange={(e) => setVegFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="thisYear">This Year</option>
              <option value="6Months">Last 6 Months</option>
            </select>
          </div>
          <div
            className="hide-scrollbar"
            style={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div style={{ minWidth: "500px", height: 200 }}>
              {getFilteredData(vegFilter).some(
                (d) => d.DemandVeg > 0 || d.SupplyVeg > 0
              ) ? (
                <ResponsiveContainer>
                  <BarChart
                    data={getFilteredData(vegFilter)}
                    barSize={30}
                    barGap={4}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      allowDecimals={false}
                      interval={0}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar
                      dataKey="DemandVeg"
                      name="Demand"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="SupplyVeg"
                      name="Supply"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="ad-empty-chart">
                  <FaLeaf size={40} />
                  <span>No vegetable data available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Supply Chain Flow Volume (Bottleneck Analysis) */}
      <div className="ad-revenue-row" style={{ marginTop: "1.5rem" }}>
        <div className="ad-chart-card">
          <div
            className="ad-chart-header"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className="ad-chart-title">Supply Chain Flow Volume</div>
            <select
              value={pipeFilter}
              onChange={(e) => setPipeFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="thisYear">This Year</option>
              <option value="6Months">Last 6 Months</option>
            </select>
          </div>
          <div
            className="hide-scrollbar"
            style={{ width: "100%", overflowX: "auto" }}
          >
            <div style={{ minWidth: "800px", height: 300 }}>
              {getFilteredData(pipeFilter).some(
                (d) =>
                  d.PipeFarmer > 0 ||
                  d.PipeCollector > 0 ||
                  d.PipeSupplier > 0 ||
                  d.PipeBuyer > 0
              ) ? (
                <ResponsiveContainer>
                  <BarChart
                    data={getFilteredData(pipeFilter)}
                    barSize={30}
                    barGap={8}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      allowDecimals={false}
                      interval={0}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar
                      dataKey="PipeFarmer"
                      name="1. Farmer Production"
                      fill="#1DC956"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="PipeCollector"
                      name="2. Collector Wholesale"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="PipeSupplier"
                      name="3. Supplier Inventory"
                      fill="#F59E0B"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="PipeBuyer"
                      name="4. Buyer Consumption"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="ad-empty-chart">
                  <FaTruck size={40} />
                  <span>No supply chain data available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue and Top Products Row */}
      <div className="ad-ds-grid" style={{ marginTop: "1.5rem" }}>
        <div className="ad-chart-card">
          <div
            className="ad-chart-header"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className="ad-chart-title">Monthly Revenue Trend</div>
            <select
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="thisYear">This Year</option>
              <option value="6Months">Last 6 Months</option>
            </select>
          </div>
          <div
            className="hide-scrollbar"
            style={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div style={{ minWidth: "350px", height: 230 }}>
              {getFilteredData(revenueFilter).some((d) => d.Amount > 0) ? (
                <ResponsiveContainer>
                  <LineChart
                    data={getFilteredData(revenueFilter)}
                    margin={{ top: 20, right: 10, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      interval={0}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      allowDecimals={false}
                      interval={0}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Amount"
                      stroke="#1DC956"
                      strokeWidth={3}
                      dot={{
                        r: 3,
                        fill: "#1DC956",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="ad-empty-chart">
                  <FaMoneyBillWave size={35} />
                  <span>No revenue data recorded</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ad-chart-card">
          <div className="ad-chart-header">
            <div className="ad-chart-title">Platform Composition</div>
          </div>
          <div style={{ height: 230, display: "flex", alignItems: "center" }}>
            {userCompositionData.some((d) => d.value > 0) ? (
              <>
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie
                      data={userCompositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userCompositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ width: "40%", paddingLeft: "1rem" }}>
                  {userCompositionData.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: item.color,
                          marginRight: "8px",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            color: "#1f2937",
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                          {item.value} Users
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="ad-empty-chart">
                <FaUsers size={35} />
                <span>No registered users found</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
