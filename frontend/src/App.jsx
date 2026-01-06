import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Components/Landing Page/LandingPage';
import FarmerDashboard from './Components/Dashboards/FarmerDashboard';
import CollectorDashboard from './Components/Dashboards/CollectorDashboard';
import SupplierDashboard from './Components/Dashboards/SupplierDashboard';
import BuyerDashboard from './Components/Dashboards/BuyerDashboard';
import SuccessPopup from './Components/Landing Page/SuccessPopup';
import ProtectedRoute from './Components/Auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
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

        <Route path="/success-popup" element={<SuccessPopup />} />
      </Routes>
    </Router>
  );
}

export default App;
