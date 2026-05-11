import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
        
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>Forgot Password</h2>
        
        {message && <div className="auth-success" style={{ color: 'green', marginBottom: '15px', textAlign: 'center' }}>{message}</div>}
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label className="form-label">Enter your registered email :</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="eg@lhr.nu.edu.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="login-actions" style={{ flexDirection: 'column', gap: '10px' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Processing...' : 'SEND RESET LINK'}
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ width: '100%', backgroundColor: '#666' }}
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
