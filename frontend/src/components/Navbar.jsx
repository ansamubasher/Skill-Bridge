import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Bell, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import '../pages/Profile.css';

const Navbar = ({ hideLinks }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="nav-logo">
          <span style={{ color: 'var(--primary)' }}>S</span>kill<span style={{ color: 'var(--primary)' }}>B</span>ridge
        </h2>
        {!hideLinks && (
          <ul className="nav-links">
            <li>Find work <ChevronDown size={16} /></li>
            <li>Deliver work <ChevronDown size={16} /></li>
            <li>Manage Finances <ChevronDown size={16} /></li>
            <li>Messages</li>
          </ul>
        )}
      </div>
      
      <div className="nav-right">
        <HelpCircle className="nav-icon" />
        <Bell className="nav-icon" />
        
        <div className="user-menu" onClick={handleLogout} title="Click to logout for now">
          {/* Avatar placeholder */}
          <div className="avatar-small">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
