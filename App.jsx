import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import IssueAsset from './pages/IssueAsset';
import WeaponsTaken from './pages/WeaponsTaken';
import ReturnedAssets from './pages/ReturnedAssets';
import Procurement from './pages/Procurement';
import Suppliers from './pages/Suppliers';
import AuditLogs from './pages/AuditLogs';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="issue" element={<IssueAsset />} />
        <Route path="issued" element={<WeaponsTaken />} />
        <Route path="returns" element={<ReturnedAssets />} />
        <Route path="procurement" element={<Procurement />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="audit" element={<AdminRoute><AuditLogs /></AdminRoute>} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
