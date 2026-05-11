import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { registerUser } from '../services/api';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [role, setRole] = useState('freelancer'); // 'freelancer' | 'client'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: [role],
      };

      await registerUser(payload);

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="split-screen-container">
      <div className="split-left auth-gradient-bg" />

      <div className="split-right">
        <div className="register-content">
          <div className="register-header">
            <h1 className="auth-logo">
              <span style={{ color: 'var(--primary)' }}>S</span>kill
              <span style={{ color: 'var(--primary)' }}>B</span>ridge
            </h1>
            <p className="auth-tagline">University-Verified Micro Freelancing</p>
          </div>

          <h2 className="register-title">Create your account</h2>

          {/* ── Role Picker ─────────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 10 }}>
              I want to join as a:
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                {
                  value: 'freelancer',
                  label: 'Freelancer',
                  icon: '💼',
                  desc: 'I want to find work & earn',
                },
                {
                  value: 'client',
                  label: 'Client',
                  icon: '🏢',
                  desc: 'I want to hire talent',
                },
              ].map((opt) => {
                const active = role === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    style={{
                      flex: 1,
                      border: `2px solid ${active ? 'var(--primary)' : '#ccc'}`,
                      borderRadius: 12,
                      padding: '14px 12px',
                      background: active ? 'rgba(240,90,40,0.06)' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                    }}
                  >
                    <div style={{ fontSize: 26, marginBottom: 4 }}>{opt.icon}</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: active ? 'var(--primary)' : '#1a1a1a',
                        marginBottom: 3,
                      }}
                    >
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>{opt.desc}</div>
                    {active && (
                      <div
                        style={{
                          marginTop: 8,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '8px auto 0',
                        }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div
              className="auth-error"
              style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full name*</label>
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email address* (University Address ONLY)</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="eg@lhr.nu.edu.pk"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Enter password*</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <small className="password-hint">
                Password must be at least 8 characters, including a number and special character
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password*</label>
              <input
                type="password"
                name="confirmPassword"
                className="input-field"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-dark w-100" disabled={loading}>
              {loading
                ? 'Creating...'
                : `Create ${role === 'client' ? 'Client' : 'Freelancer'} Account`}
            </button>

            <div className="login-link-container">
              <p>
                Already have an account?{' '}
                <span
                  onClick={() => navigate('/login')}
                  className="text-primary cursor-pointer"
                >
                  Login here
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
