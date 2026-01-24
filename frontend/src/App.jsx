import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Components/Landing Page/LandingPage";
import PaymentSuccess from "./Components/Common/PaymentSuccess";
import PaymentFailure from "./Components/Common/PaymentFailure";
import FarmerDashboard from "./Components/Dashboards/Farmer Dashboard/FarmerDashboard";
import CollectorDashboard from "./Components/Dashboards/Collector Dashboard/CollectorDashboard";
import SupplierDashboard from "./Components/Dashboards/Supplier Dashboard/SupplierDashboard";
import BuyerDashboard from "./Components/Dashboards/Buyer Dashboard/BuyerDashboard";
import AdminDashboard from "./Components/Dashboards/Admin Dashboard/AdminDashboard";
import DocumentViewer from "./Components/Dashboards/Admin Dashboard/DocumentViewer";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import { SocketProvider } from "./context/SocketContext";

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/farmer-dashboard"
            element={
              <ProtectedRoute allowedRole="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collector-dashboard"
            element={
              <ProtectedRoute allowedRole="collector">
                <CollectorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-dashboard"
            element={
              <ProtectedRoute allowedRole="supplier">
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute allowedRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/document" element={<DocumentViewer />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
