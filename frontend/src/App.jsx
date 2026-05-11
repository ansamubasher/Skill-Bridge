import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ClientDashboard from './pages/ClientDashboard';
import PostProject from './pages/PostProject';
import FreelancerDashboard from './pages/freelancerDashboard';
import ProjectDetail from './pages/projectDetails';
import MessagesPage from './pages/shared/MessagesPage';

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

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Client routes */}
          <Route path="/dashboard"    element={<PrivateRoute><ClientDashboard /></PrivateRoute>} />
          <Route path="/post-project" element={<PrivateRoute><PostProject /></PrivateRoute>} />

          {/* Freelancer routes */}
          <Route path="/freelancer-dashboard" element={<PrivateRoute><FreelancerPage /></PrivateRoute>} />

          {/* Shared */}
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
