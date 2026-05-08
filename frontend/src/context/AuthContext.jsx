import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('sb_token');
      if (token) {
        try {
          const res = await api.get('/users/profile');
          setUser(res.data.user);
        } catch (error) {
          console.error("Token invalid or expired", error);
          localStorage.removeItem('sb_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('sb_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('sb_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
