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

  // Mock Current Year Data
  const currentYearData = [
    { name: "Jan", Farmers: 20, Collectors: 30, Suppliers: 10, Buyers: 40, Amount: 4000, DemandVeg: 400, SupplyVeg: 240, DemandFruit: 350, SupplyFruit: 300 },
    { name: "Feb", Farmers: 25, Collectors: 32, Suppliers: 12, Buyers: 45, Amount: 3000, DemandVeg: 300, SupplyVeg: 139, DemandFruit: 450, SupplyFruit: 400 },
    { name: "Mar", Farmers: 30, Collectors: 35, Suppliers: 15, Buyers: 50, Amount: 5000, DemandVeg: 200, SupplyVeg: 380, DemandFruit: 250, SupplyFruit: 200 },
    { name: "Apr", Farmers: 35, Collectors: 38, Suppliers: 18, Buyers: 55, Amount: 4500, DemandVeg: 278, SupplyVeg: 390, DemandFruit: 300, SupplyFruit: 350 },
    { name: "May", Farmers: 40, Collectors: 40, Suppliers: 20, Buyers: 60, Amount: 6000, DemandVeg: 189, SupplyVeg: 480, DemandFruit: 200, SupplyFruit: 150 },
    { name: "Jun", Farmers: 45, Collectors: 42, Suppliers: 22, Buyers: 65, Amount: 5500, DemandVeg: 239, SupplyVeg: 380, DemandFruit: 400, SupplyFruit: 410 },
    { name: "Jul", Farmers: 40, Collectors: 24, Suppliers: 24, Buyers: 60, Amount: 4800, DemandVeg: 349, SupplyVeg: 430, DemandFruit: 380, SupplyFruit: 320 },
    { name: "Aug", Farmers: 30, Collectors: 13, Suppliers: 22, Buyers: 50, Amount: 5200, DemandVeg: 400, SupplyVeg: 240, DemandFruit: 350, SupplyFruit: 300 },
    { name: "Sep", Farmers: 20, Collectors: 38, Suppliers: 22, Buyers: 70, Amount: 6100, DemandVeg: 300, SupplyVeg: 139, DemandFruit: 450, SupplyFruit: 400 },
    { name: "Oct", Farmers: 27, Collectors: 39, Suppliers: 20, Buyers: 65, Amount: 5900, DemandVeg: 200, SupplyVeg: 380, DemandFruit: 250, SupplyFruit: 200 },
    { name: "Nov", Farmers: 18, Collectors: 48, Suppliers: 21, Buyers: 80, Amount: 7000, DemandVeg: 278, SupplyVeg: 390, DemandFruit: 300, SupplyFruit: 350 },
    { name: "Dec", Farmers: 23, Collectors: 38, Suppliers: 25, Buyers: 90, Amount: 8000, DemandVeg: 189, SupplyVeg: 480, DemandFruit: 200, SupplyFruit: 150 },
  ];

  // Mock Previous Year Data (for 6-month context in early year)
  const previousYearData = [
    { name: "Jul", Farmers: 35, Collectors: 20, Suppliers: 15, Buyers: 50, Amount: 3800, DemandVeg: 350, SupplyVeg: 200, DemandFruit: 300, SupplyFruit: 280 },
    { name: "Aug", Farmers: 28, Collectors: 15, Suppliers: 18, Buyers: 45, Amount: 4200, DemandVeg: 380, SupplyVeg: 220, DemandFruit: 320, SupplyFruit: 290 },
    { name: "Sep", Farmers: 25, Collectors: 30, Suppliers: 20, Buyers: 60, Amount: 4900, DemandVeg: 280, SupplyVeg: 150, DemandFruit: 400, SupplyFruit: 350 },
    { name: "Oct", Farmers: 32, Collectors: 35, Suppliers: 25, Buyers: 55, Amount: 5100, DemandVeg: 220, SupplyVeg: 350, DemandFruit: 280, SupplyFruit: 220 },
    { name: "Nov", Farmers: 22, Collectors: 40, Suppliers: 24, Buyers: 75, Amount: 6500, DemandVeg: 290, SupplyVeg: 370, DemandFruit: 310, SupplyFruit: 340 },
  ];
  
  const userCompositionData = [
    { name: "Farmers", value: stats?.totalFarmers || 120, color: "#1DC956" },
    { name: "Collectors", value: stats?.totalCollectors || 45, color: "#3B82F6" },
    { name: "Suppliers", value: stats?.totalSuppliers || 32, color: "#F59E0B" },
    { name: "Buyers", value: stats?.totalBuyers || 380, color: "#EF4444" },
  ];

  // Helper to slice data dynamically based on filter
  const getFilteredData = (filterType) => {
    // Use real current date
    const currentMonthIndex = new Date().getMonth(); // 0 for Jan, 1 for Feb, etc.

    if (filterType === "thisYear") {
      // Show Jan to Current Month
      return currentYearData.slice(0, currentMonthIndex + 1);
    } else {
      // Show Last 6 Months (inclusive of current)
      if (currentMonthIndex >= 5) {
        // If June (5) or later, we can just slice current year
        return currentYearData.slice(currentMonthIndex - 5, currentMonthIndex + 1);
      } else {
        const monthsNeededFromPrev = 5 - currentMonthIndex;
        const prevSlice = previousYearData.slice(previousYearData.length - monthsNeededFromPrev);
        const currSlice = currentYearData.slice(0, currentMonthIndex + 1);
        return [...prevSlice, ...currSlice];
      }
    }
  };

  // Common Dropdown Style
  const filterStyle = {
    padding: '0.3rem', 
    borderRadius: '4px', 
    border: '1px solid #E5E7EB', 
    fontSize: '0.8rem', 
    color: '#4B5563',
    marginLeft: 'auto',
    outline: 'none',
    cursor: 'pointer'
  };

  return (
    <div className="admin-overview">
      <div className="ad-stats-grid">
        <div className="ad-stat-card ad-card-green">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Total Revenue</span>
            <FaChartLine className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">NPR {stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : "1,24,000"}</div>
          <div className="ad-stat-change">+12.5% from last month</div>
        </div>
        <div className="ad-stat-card ad-card-blue">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Total Orders</span>
            <FaShoppingCart className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">{stats?.totalOrders || "1,452"}</div>
          <div className="ad-stat-change">+8.2% from last month</div>
        </div>
        <div className="ad-stat-card ad-card-yellow">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Total Users</span>
            <FaUsers className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">{stats?.totalUsers || "584"}</div>
          <div className="ad-stat-change">+24 new this week</div>
        </div>
        <div className="ad-stat-card ad-card-red">
          <div className="ad-stat-header">
            <span className="ad-stat-title">Growth Rate</span>
            <FaArrowUp className="ad-stat-icon" />
          </div>
          <div className="ad-stat-value">18.2%</div>
          <div className="ad-stat-change">Highest in December</div>
        </div>
      </div>

      <div className="ad-category-stats">
        <div className="ad-cat-card cat-farmers">
          <div className="ad-cat-icon-wrapper">
            <FaUsers />
          </div>
          <div className="ad-cat-info">
            <div className="ad-cat-title">Farmers</div>
            <div className="ad-cat-val">{stats?.totalFarmers || 120}</div>
          </div>
        </div>
        <div className="ad-cat-card cat-collectors">
          <div className="ad-cat-icon-wrapper">
            <FaTruck />
          </div>
          <div className="ad-cat-info">
            <div className="ad-cat-title">Collectors</div>
            <div className="ad-cat-val">{stats?.totalCollectors || 45}</div>
          </div>
        </div>
        <div className="ad-cat-card cat-suppliers">
          <div className="ad-cat-icon-wrapper">
            <FaTruck style={{ transform: "scaleX(-1)" }} />
          </div>
          <div className="ad-cat-info">
            <div className="ad-cat-title">Suppliers</div>
            <div className="ad-cat-val">{stats?.totalSuppliers || 32}</div>
          </div>
        </div>
        <div className="ad-cat-card cat-buyers">
          <div className="ad-cat-icon-wrapper">
            <FaShoppingBag />
          </div>
          <div className="ad-cat-info">
            <div className="ad-cat-title">Buyers</div>
            <div className="ad-cat-val">{stats?.totalBuyers || 380}</div>
          </div>
        </div>
        <div className="ad-cat-card cat-products">
          <div className="ad-cat-icon-wrapper">
            <FaBoxes />
          </div>
          <div className="ad-cat-info">
            <div className="ad-cat-title">Products</div>
            <div className="ad-cat-val">{stats?.totalProducts || "1,240"}</div>
          </div>
        </div>
      </div>

      {/* Charts Section 1: User Growth */}
      <div className="ad-charts-section">
        <div className="ad-chart-card">
          <div className="ad-chart-header" style={{ display: 'flex', alignItems: 'center' }}>
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
          <div style={{ width: "100%", overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: '600px', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={getFilteredData(growthFilter)} barSize={30} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
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
                  />
                  <Tooltip 
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Farmers" fill="#1DC956" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="Collectors"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="Suppliers" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Buyers" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="ad-chart-card">
          <div className="ad-chart-header">
            <div className="ad-chart-title">Recent Activities</div>
          </div>
          <div className="ad-recent-activity">
            <div className="activity-item">
              <div className="activity-icon">
                <FaUsers />
              </div>
              <div className="activity-info">
                <h4>New Farmer Registered</h4>
                <p>Ram B. registered 5 mins ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <FaShoppingCart />
              </div>
              <div className="activity-info">
                <h4>Order #12345 Placed</h4>
                <p>By Restaurant ABC • 15 mins ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <FaUsers />
              </div>
              <div className="activity-info">
                <h4>New Collector Verified</h4>
                <p>Shyam K. verified by Admin A</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <FaLeaf />
              </div>
              <div className="activity-info">
                <h4>New Product Added</h4>
                <p>Organic Apples added by Farm X</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demand/Supply Grid */}
      <div className="ad-ds-grid">
        <div className="ad-chart-card">
          <div className="ad-chart-header" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="ad-chart-title">Demand vs Supply (Veg)</div>
            <select 
                value={vegFilter} 
                onChange={(e) => setVegFilter(e.target.value)}
                style={filterStyle}
            >
                <option value="thisYear">This Year</option>
                <option value="6Months">Last 6 Months</option>
            </select>
          </div>
          <div style={{ width: "100%", overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: '500px', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={getFilteredData(vegFilter)} barSize={30} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
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
                    domain={[0, 600]}
                    ticks={[0, 150, 300, 450, 600]}
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
                  <Legend />
                  <Bar dataKey="DemandVeg" name="Demand" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="SupplyVeg" name="Supply" fill="#1DC956" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="ad-chart-card">
          <div className="ad-chart-header" style={{ display: 'flex', alignItems: 'center' }}>
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
          <div style={{ width: "100%", overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: '500px', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={getFilteredData(fruitFilter)} barSize={30} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
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
                    domain={[0, 600]}
                    ticks={[0, 150, 300, 450, 600]}
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
                  <Legend />
                  <Bar dataKey="DemandFruit" name="Demand" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="SupplyFruit" name="Supply" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue and Top Products Row */}
      <div className="ad-ds-grid" style={{ marginTop: '1.5rem' }}>
        <div className="ad-chart-card">
          <div className="ad-chart-header" style={{ display: 'flex', alignItems: 'center' }}>
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
          <div style={{ width: "100%", overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: '350px', height: 230 }}>
              <ResponsiveContainer>
                <LineChart data={getFilteredData(revenueFilter)} margin={{ top: 20, right: 10, bottom: 5, left: 0 }}>
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
            </div>
          </div>
        </div>

        <div className="ad-chart-card">
          <div className="ad-chart-header">
            <div className="ad-chart-title">Platform Composition</div>
          </div>
          <div style={{ height: 230, display: 'flex', alignItems: 'center' }}>
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
            <div style={{ width: '40%', paddingLeft: '1rem' }}>
              {userCompositionData.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, marginRight: '8px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1f2937' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{item.value} Users</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AdminOverview;
