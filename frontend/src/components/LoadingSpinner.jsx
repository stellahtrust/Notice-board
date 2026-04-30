import React from 'react';
import '../styles/global.css';

export default function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '20px', color: '#666' }}>Loading...</p>
    </div>
  );
}