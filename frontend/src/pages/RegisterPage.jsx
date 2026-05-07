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
      return setError("Passwords do not match");
    }

    setLoading(true);
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: ['freelancer'] 
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
      <div className="split-left auth-gradient-bg"></div>
      
      <div className="split-right">
        <div className="register-content">
          <div className="register-header">
            <h1 className="auth-logo">
              <span style={{ color: 'var(--primary)' }}>S</span>kill<span style={{ color: 'var(--primary)' }}>B</span>ridge
            </h1>
            <p className="auth-tagline">University-Verified Micro Freelancing</p>
          </div>

          <h2 className="register-title">Create your account</h2>
          
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-error" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}>{success}</div>}
          
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
              <small className="password-hint">Password must be at least 8 characters, including a number and special character</small>
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
              {loading ? 'Creating...' : 'Create account'}
            </button>
            
            <div className="login-link-container">
              <p>Already have an account? <span onClick={() => navigate('/login')} className="text-primary cursor-pointer">Login here</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
