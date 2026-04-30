import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loginMode, setLoginMode] = useState('user'); // 'user' | 'admin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      const role = response?.user?.role;

      if (loginMode === 'admin' && role !== 'admin') {
        // keep user from entering admin flow
        logout();
        setError('❌ This email does not belong to an admin account.');
        return;
      }

      if (role === 'admin') {
        navigate('/admin-dashboard');
        return;
      }

      navigate('/notices');
    } catch (err) {
      setError(err.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>🔐 Login</h2>
          <p>Access your UMU Notice Board</p>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label htmlFor="loginMode">Login as</label>
            <select
              id="loginMode"
              name="loginMode"
              value={loginMode}
              onChange={(e) => setLoginMode(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 8 }}
            >
              <option value="user">Student/Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <div className="alert alert-error">❌ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? '⏳ Logging in...' : '✓ Login'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
