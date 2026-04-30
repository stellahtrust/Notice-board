import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import umuLogo from '../assets/umu-logo.jpg';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src={umuLogo} alt="UMU Logo" className="brand-logo" />
          UMU Notice Board
        </Link>

        <div className="navbar-menu">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link btn btn-primary">Register</Link>
            </>
          ) : (
            <>
              <Link to="/notices" className="nav-link">Browse Notices</Link>
              {(user.role === 'admin' || user.role === 'faculty') && (
                <Link to="/create-notice" className="nav-link">✍️ Post Notice</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin-dashboard" className="nav-link">⚙️ Admin Panel</Link>
              )}
              <div className="nav-user">
                <div>
                  <div className="nav-username">👤 {user.name}</div>
                  <div className="nav-role">{user.role.toUpperCase()}</div>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
