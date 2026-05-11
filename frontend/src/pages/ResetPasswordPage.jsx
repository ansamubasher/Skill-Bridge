import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
      alert('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-gradient-bg auth-container-center">
      <div className="login-modal">
        <h1 className="auth-logo">
          <span style={{ color: 'var(--primary)' }}>S</span>kill<span style={{ color: 'var(--primary)' }}>B</span>ridge
        </h1>
        
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>Reset Password</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label className="form-label">New Password :</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password :</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="login-actions">
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Resetting...' : 'RESET PASSWORD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
