import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/api';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const isClient = user?.role?.includes('client');
      navigate(isClient ? '/dashboard' : '/freelancer-dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      const userData = res.data.user;
      login(userData, res.data.token);
      const isClient = userData?.role?.includes('client');
      navigate(isClient ? '/dashboard' : '/freelancer-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Enter Email :</label>
            <input
              type="email"
              className="input-field"
              placeholder="eg@lhr.nu.edu.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Enter password*</label>
            <input
              type="password"
              className="input-field"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div style={{ textAlign: 'right', marginTop: '4px' }}>
              <span
                className="forgot-password-link"
                onClick={() => navigate('/forgot-password')}
                style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}
              >
                Forgot Password?
              </span>
            </div>
          </div>

          <div className="login-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/register')}
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
