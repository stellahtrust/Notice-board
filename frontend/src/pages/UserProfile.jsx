import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import '../styles/Profile.css';

export default function UserProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userNotices, setUserNotices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    faculty: '',
    studentId: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users/profile');
      setFormData({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || '',
        faculty: response.data.faculty || '',
        studentId: response.data.studentId || ''
      });

      // Fetch user's notices
      const noticesResponse = await axios.get('/api/notices');
      const myNotices = noticesResponse.data.filter(n => n.author._id === user.id);
      setUserNotices(myNotices);
    } catch (err) {
      setError('❌ Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/users/profile', formData);
      setSuccess('✅ Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('❌ Error updating profile');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="profile-page">
        <div className="container">
          <div className="profile-wrapper">
            {/* PROFILE SIDEBAR */}
            <aside className="profile-sidebar">
              <div className="profile-card">
                <div className="profile-avatar">
                  👤 {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h2>{user?.name}</h2>
                <p className="profile-role">{user?.role.toUpperCase()}</p>
                <div className="profile-stats">
                  <div className="stat">
                    <div className="stat-number">{userNotices.length}</div>
                    <div className="stat-label">Notices Posted</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* PROFILE MAIN CONTENT */}
            <main className="profile-main">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* PROFILE INFORMATION */}
              <section className="profile-section">
                <div className="section-header">
                  <h3>👤 Profile Information</h3>
                  <button 
                    onClick={() => setEditing(!editing)} 
                    className="btn btn-primary btn-sm"
                  >
                    {editing ? 'Cancel' : '✏️ Edit'}
                  </button>
                </div>

                {editing ? (
                  <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    {user?.role === 'student' && (
                      <>
                        <div className="form-group">
                          <label>Faculty</label>
                          <input
                            type="text"
                            name="faculty"
                            value={formData.faculty}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>Student ID</label>
                          <input
                            type="text"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}

                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </form>
                ) : (
                  <div className="profile-info">
                    <div className="info-item">
                      <label>Full Name</label>
                      <p>{formData.name}</p>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <p>{formData.email}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <p>{formData.phone || 'Not provided'}</p>
                    </div>
                    {user?.role === 'student' && (
                      <>
                        <div className="info-item">
                          <label>Faculty</label>
                          <p>{formData.faculty || 'Not specified'}</p>
                        </div>
                        <div className="info-item">
                          <label>Student ID</label>
                          <p>{formData.studentId || 'Not provided'}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </section>

              {/* MY NOTICES SECTION */}
              {(user?.role === 'admin' || user?.role === 'faculty') && (
                <section className="profile-section">
                  <h3>📝 My Notices ({userNotices.length})</h3>
                  
                  {userNotices.length === 0 ? (
                    <div className="no-data">
                      <p>You haven't posted any notices yet.</p>
                      <a href="/create-notice" className="btn btn-primary">Post a Notice</a>
                    </div>
                  ) : (
                    <div className="notices-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Posted</th>
                            <th>Views</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userNotices.map(notice => (
                            <tr key={notice._id}>
                              <td>{notice.title}</td>
                              <td>{notice.category}</td>
                              <td><span className={`badge badge-${notice.status}`}>{notice.status}</span></td>
                              <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                              <td>{notice.viewCount}</td>
                              <td>
                                <a href={`/notice/${notice._id}`} className="table-link">View</a>
                                <a href={`/edit-notice/${notice._id}`} className="table-link">Edit</a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}