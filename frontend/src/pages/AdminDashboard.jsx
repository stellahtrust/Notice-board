import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import '../styles/admin.css';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pendingNotices, setPendingNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPendingNotices();
  }, [user, navigate]);

  const fetchPendingNotices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/notices/pending');
      setPendingNotices(response.data);
    } catch (err) {
      setError('❌ Error loading pending notices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (noticeId) => {
    try {
      await axios.put(`/api/notices/${noticeId}/approve`);
      setPendingNotices(pendingNotices.filter(n => n._id !== noticeId));
      setSelectedNotice(null);
    } catch (err) {
      setError('❌ Error approving notice');
    }
  };

  const handleReject = async (noticeId) => {
    if (!rejectReason.trim()) {
      setError('❌ Please provide a rejection reason');
      return;
    }
    try {
      await axios.put(`/api/notices/${noticeId}/reject`, { reason: rejectReason });
      setPendingNotices(pendingNotices.filter(n => n._id !== noticeId));
      setSelectedNotice(null);
      setRejectReason('');
    } catch (err) {
      setError('❌ Error rejecting notice');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="admin-page">
        <div className="container">
          <h1>⚙️ Admin Dashboard</h1>

          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{pendingNotices.length}</div>
                <div className="stat-label">Pending Notices</div>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="admin-content">
            <div className="notices-pending-section">
              <h2>Pending Approvals</h2>

              {pendingNotices.length === 0 ? (
                <div className="no-data">
                  <div className="icon">✅</div>
                  <p>No pending notices. All caught up!</p>
                </div>
              ) : (
                <div className="pending-list">
                  {pendingNotices.map((notice) => (
                    <div 
                      key={notice._id} 
                      className={`pending-item ${selectedNotice?._id === notice._id ? 'active' : ''}`}
                      onClick={() => setSelectedNotice(notice)}
                    >
                      <div className="pending-title">{notice.title}</div>
                      <div className="pending-meta">
                        <span>By: {notice.authorName}</span>
                        <span>Category: {notice.category}</span>
                        <span className={`badge badge-${notice.priority}`}>{notice.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedNotice && (
              <div className="notice-preview-section">
                <h3>Review Notice</h3>
                <div className="preview-card">
                  <h4>{selectedNotice.title}</h4>
                  <div className="preview-meta">
                    <p><strong>Author:</strong> {selectedNotice.authorName}</p>
                    <p><strong>Category:</strong> {selectedNotice.category}</p>
                    <p><strong>Priority:</strong> {selectedNotice.priority}</p>
                  </div>
                  <div className="preview-content">
                    {selectedNotice.content}
                  </div>

                  <div className="approval-actions">
                    <button 
                      onClick={() => handleApprove(selectedNotice._id)}
                      className="btn btn-primary"
                    >
                      ✓ Approve
                    </button>
                    
                    <div className="reject-section">
                      <textarea
                        placeholder="Rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <button 
                        onClick={() => handleReject(selectedNotice._id)}
                        className="btn btn-secondary"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}