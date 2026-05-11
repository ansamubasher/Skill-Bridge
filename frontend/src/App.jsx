import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { PaymentProvider } from './context/PaymentContext';
import { NotificationProvider } from './context/NotificationContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ClientDashboard from './pages/ClientDashboard';
import ViewBids from './pages/ViewBids';
import PostProject from './pages/PostProject';
import FreelancerDashboard from './pages/freelancerDashboard';
import ProjectDetail from './pages/projectDetails';
import MessagesPage from './pages/shared/MessagesPage';
import PaymentDashboard from './pages/PaymentDashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f05a28', fontWeight: 600 }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Freelancer page: shows dashboard, clicking a project shows detail inline
const FreelancerPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  if (selectedId) return <ProjectDetail projectId={selectedId} onBack={() => setSelectedId(null)} />;
  return <FreelancerDashboard onSelectProject={setSelectedId} />;
};

// Smart root redirect: logged-in → dashboard, guest → login
const RootRedirect = () => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f05a28', fontWeight: 600 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  const isClient = Array.isArray(user?.role) ? user.role.includes('client') : user?.role === 'client';
  return <Navigate to={isClient ? '/dashboard' : '/freelancer-dashboard'} replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <PaymentProvider>
          <Router>
            <Routes>
              {/* Public */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              {/* Client routes */}
              <Route path="/dashboard"    element={<PrivateRoute><ClientDashboard /></PrivateRoute>} />
              <Route path="/post-project" element={<PrivateRoute><PostProject /></PrivateRoute>} />
              <Route path="/view-bids"    element={<PrivateRoute><ViewBids /></PrivateRoute>} />

              {/* Freelancer routes */}
              <Route path="/freelancer-dashboard" element={<PrivateRoute><FreelancerPage /></PrivateRoute>} />

              {/* Shared */}
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
              <Route path="/manage-finances" element={<PrivateRoute><PaymentDashboard /></PrivateRoute>} />

              {/* Root: smart redirect based on auth state */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </PaymentProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
