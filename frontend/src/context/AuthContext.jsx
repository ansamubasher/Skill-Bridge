import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(localStorage.getItem('sb_token'));

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('sb_token');
      if (storedToken) {
        try {
          const res = await api.get('/users/profile');
          setUser(res.data.user);
          setToken(storedToken);
        } catch (error) {
          console.error("Token invalid or expired", error);
          localStorage.removeItem('sb_token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, newToken) => {
    localStorage.setItem('sb_token', newToken);
    setUser(userData);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('sb_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
