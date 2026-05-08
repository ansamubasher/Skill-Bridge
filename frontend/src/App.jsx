import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientDashboard from './pages/ClientDashboard';
import PostProject from './pages/PostProject';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route → Client Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/post-project" element={<PostProject />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
