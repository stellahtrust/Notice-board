import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/notfound.css';

export default function NotFound() {
  return (
    <>
      <div className="notfound-page">
        <div className="container">
          <div className="notfound-content">
            <div className="notfound-icon">404</div>
            <h1>Page Not Found</h1>
            <p>Sorry, the page you're looking for doesn't exist or has been moved.</p>
            <div className="notfound-actions">
              <Link to="/" className="btn btn-primary">← Go Home</Link>
              <Link to="/notices" className="btn btn-ghost">Browse Notices</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}