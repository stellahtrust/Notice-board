import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import '../styles/noticedetail-enhanced.css';

export default function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/notices/${id}`);
      setNotice(response.data);
    } catch (err) {
      setError('❌ Error loading notice');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await axios.delete(`/api/notices/${id}`);
        navigate('/notices');
      } catch (err) {
        setError('❌ Error deleting notice');
      }
    }
  };

  const handleDownloadPDF = () => {
    // Create PDF download functionality
    const element = document.getElementById('notice-content');
    alert('PDF download functionality coming soon!');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // API call to add comment
      setComments([...comments, {
        author: user.name,
        content: newComment,
        date: new Date().toLocaleString()
      }]);
      setNewComment('');
      setCommentError('');
    } catch (err) {
      setCommentError('❌ Error posting comment');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !notice) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="alert alert-error">{error || 'Notice not found'}</div>
        <button onClick={() => navigate('/notices')} className="btn btn-primary">
          ← Back to Notices
        </button>
      </div>
    );
  }

  const canEdit = user && (user.id === notice.author._id || user.role === 'admin');

  return (
    <>
      <div className="notice-detail-page">
        <div className="container">
          <button onClick={() => navigate('/notices')} className="btn btn-ghost back-btn">
            ← Back to Notices
          </button>

          <div className="notice-detail-wrapper">
            {/* SIDEBAR - Author & Meta Info */}
            <aside className="detail-sidebar">
              <div className="sidebar-card author-card">
                <h4>👤 Author Information</h4>
                <p><strong>Posted By:</strong> {notice.authorName}</p>
                <p><strong>Department:</strong> {notice.department || 'N/A'}</p>
                {notice.contactEmail && (
                  <p><strong>Email:</strong> <a href={`mailto:${notice.contactEmail}`}>{notice.contactEmail}</a></p>
                )}
                {notice.contactPhone && (
                  <p><strong>Phone:</strong> <a href={`tel:${notice.contactPhone}`}>{notice.contactPhone}</a></p>
                )}
              </div>

              <div className="sidebar-card meta-card">
                <h4>📊 Notice Details</h4>
                <p><strong>Status:</strong> <span className={`badge badge-${notice.status}`}>{notice.status}</span></p>
                <p><strong>Priority:</strong> <span className={`badge badge-${notice.priority}`}>{notice.priority}</span></p>
                <p><strong>Posted:</strong> {new Date(notice.createdAt).toLocaleString()}</p>
                {notice.expiryDate && (
                  <p><strong>Expires:</strong> {new Date(notice.expiryDate).toLocaleDateString()}</p>
                )}
                <p><strong>Views:</strong> 👁️ {notice.viewCount}</p>
              </div>

              <div className="sidebar-card audience-card">
                <h4>👥 Visibility</h4>
                <p><strong>Status:</strong> {notice.visibility || 'Internal'}</p>
                <p><strong>Audience:</strong> {notice.targetAudience?.join(', ') || 'All'}</p>
                <p><strong>Locations:</strong> {notice.displayLocation?.join(', ') || 'Main'}</p>
              </div>

              {notice.tags && notice.tags.length > 0 && (
                <div className="sidebar-card tags-card">
                  <h4>🏷️ Tags</h4>
                  <div className="tags-list">
                    {notice.tags.map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {notice.thumbnailImage && (
                <div className="sidebar-card thumbnail-card">
                  <h4>🖼️ Preview Image</h4>
                  <img src={notice.thumbnailImage} alt="Notice thumbnail" className="thumbnail-img" />
                </div>
              )}
            </aside>

            {/* MAIN CONTENT */}
            <main className="detail-main">
              <div className="notice-detail-card">
                <div className="detail-header">
                  <h1>{notice.title}</h1>
                  <div className="detail-header-actions">
                    {canEdit && (
                      <>
                        <button onClick={() => navigate(`/edit-notice/${notice._id}`)} className="btn btn-primary btn-sm">
                          ✏️ Edit
                        </button>
                        <button onClick={handleDelete} className="btn btn-secondary btn-sm">
                          🗑️ Delete
                        </button>
                      </>
                    )}
                    {notice.downloadOption && (
                      <button onClick={handleDownloadPDF} className="btn btn-dark btn-sm">
                        📥 Download PDF
                      </button>
                    )}
                  </div>
                </div>

                <div className="detail-content" id="notice-content">
                  <div className="content-text">
                    {notice.content}
                  </div>
                </div>

                {/* ATTACHMENTS SECTION */}
                {(notice.attachments?.length > 0 || notice.links?.length > 0) && (
                  <div className="detail-attachments">
                    <h3>📎 Attachments & Resources</h3>
                    
                    {notice.attachments && notice.attachments.length > 0 && (
                      <div className="attachments-subsection">
                        <h4>Documents & Images</h4>
                        <ul className="attachments-list">
                          {notice.attachments.map((att, idx) => (
                            <li key={idx}>
                              <a href={att} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                📄 {typeof att === 'string' ? att.split('/').pop() : att.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {notice.links && notice.links.length > 0 && (
                      <div className="links-subsection">
                        <h4>External Links</h4>
                        <ul className="links-list">
                          {notice.links.map((link, idx) => (
                            <li key={idx}>
                              <a href={link} target="_blank" rel="noopener noreferrer" className="external-link">
                                🔗 {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* COMMENTS SECTION */}
                {notice.comments && (
                  <div className="detail-comments">
                    <h3>💬 Comments & Feedback</h3>

                    {user ? (
                      <form onSubmit={handleAddComment} className="comment-form">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your feedback or question..."
                          rows="3"
                        />
                        <button type="submit" className="btn btn-primary">Post Comment</button>
                        {commentError && <div className="alert alert-error">{commentError}</div>}
                      </form>
                    ) : (
                      <p className="login-required">Please <a href="/login">login</a> to comment.</p>
                    )}

                    <div className="comments-list">
                      {comments.length === 0 ? (
                        <p className="no-comments">No comments yet. Be the first to share!</p>
                      ) : (
                        comments.map((comment, idx) => (
                          <div key={idx} className="comment-item">
                            <div className="comment-header">
                              <strong>{comment.author}</strong>
                              <span className="comment-date">{comment.date}</span>
                            </div>
                            <p className="comment-content">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}