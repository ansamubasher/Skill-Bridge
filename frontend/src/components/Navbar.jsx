import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import '../pages/Profile.css';

const Navbar = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const isClient = Array.isArray(user?.role)
    ? user.role.includes('client')
    : user?.role === 'client';

  // Clients only see their dashboard link; freelancers see Find/Deliver work
  const navLinks = [
    ...(!isClient ? [{ name: 'Find work',   path: '/freelancer-dashboard' }] : []),
    ...(!isClient ? [{ name: 'Deliver work', path: '/deliver-work' }] : []),
    ...(isClient  ? [] : [{ name: 'Profile', path: '/profile' }]),
  ];

  useEffect(() => {
    if (user && !isClient) {
      axiosInstance.get('/notifications')
        .then(res => {
          if (res.data?.success) setNotifications(res.data.notifications);
        })
        .catch(() => {});
    }
  }, [user, isClient]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axiosInstance.patch(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      setShowNotifications(false);
      if (notif.link) navigate(notif.link);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav style={{ 
      background: "#fff", 
      borderBottom: "1px solid #e5e7eb", 
      padding: "0 24px", 
      height: 60, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      position: "sticky", 
      top: 0, 
      zIndex: 50 
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span 
          onClick={() => navigate('/')}
          style={{ fontSize: 22, fontWeight: 700, cursor: 'pointer' }}
        >
          <span style={{ color: "#f97316" }}>Skill</span>
          <span style={{ color: "#1f2937" }}>Bridge</span>
        </span>
        
        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }} className="hidden lg:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  color: isActive ? "#f97316" : "#374151",
                  fontWeight: isActive ? 600 : 400
                }}
              >
                {link.name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Notification bell — freelancers only */}
        {!isClient && (
          <div style={{ position: 'relative' }}>
            <span 
              style={{ fontSize: 18, cursor: "pointer" }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
            </span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#ef4444', color: '#fff', fontSize: 10,
                fontWeight: 700, padding: '2px 6px', borderRadius: 10
              }}>
                {unreadCount}
              </span>
            )}

            {showNotifications && (
              <div style={{
                position: 'absolute', top: 40, right: 0, width: 320,
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                maxHeight: 400, overflowY: 'auto', zIndex: 100
              }}>
                <div style={{ padding: 12, borderBottom: '1px solid #f3f4f6', fontWeight: 700, color: '#1f2937' }}>
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                    No notifications yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: 12, cursor: 'pointer', borderBottom: '1px solid #f9fafb',
                          background: !n.isRead ? '#fff7ed' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                      >
                        <p style={{ fontSize: 14, color: '#1f2937', margin: 0 }}>{n.message}</p>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0 0' }}>
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Logout button — freelancers only */}
        {!isClient && (
          <button
            onClick={handleLogout}
            style={{ 
              background: "none", border: "1px solid #e5e7eb", padding: "6px 12px", 
              borderRadius: 6, cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 500 
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
