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
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-light)',
          fontSize: '1.1rem',
          color: 'var(--primary)',
          fontWeight: 600,
        }}
      >
        Loading...
      </div>
    );
  return user ? children : <Navigate to="/login" />;
};

// Wrapper so ProjectDetail (which uses internal state for projectId) works as a page
const FreelancerDashboardPage = () => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  if (selectedProjectId) {
    return (
      <ProjectDetail
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }
  return <FreelancerDashboard onSelectProject={setSelectedProjectId} />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected — Client */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <ClientDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/post-project"
            element={
              <PrivateRoute>
                <PostProject />
              </PrivateRoute>
            }
          />

          {/* Protected — Freelancer */}
          <Route
            path="/freelancer-dashboard"
            element={
              <PrivateRoute>
                <FreelancerDashboardPage />
              </PrivateRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* Default: redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
