import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';
import '../styles/forms.css';
import '../styles/create-notice-enhanced.css';

export default function CreateNotice() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attachments, setAttachments] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    priority: 'medium',
    expiryDate: '',
    visibility: 'internal',
    targetAudience: ['all'],
    tags: '',
    department: 'General',
    contactEmail: '',
    contactPhone: '',
    displayLocation: ['main'],
    thumbnailImage: null,
    links: '',
    comments: true,
    downloadOption: true
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'faculty')) {
      navigate('/');
      return;
    }
    fetchCategories();
    setFormData(prev => ({
      ...prev,
      department: user.faculty || 'General',
      contactEmail: user.email || ''
    }));
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'targetAudience' || name === 'displayLocation') {
        setFormData(prev => ({
          ...prev,
          [name]: checked 
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

const handleThumbnailChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFormData(prev => ({
      ...prev,
      thumbnailImage: file
    }));
  }
};

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        links: formData.links.split('\n').map(link => link.trim()).filter(link => link),
        attachments: attachments.map(att => ({
          name: att.name,
          size: att.size,
          type: att.type
        }))
      };

      const response = await axios.post('/api/notices', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('✅ Notice posted successfully! Awaiting admin approval.');
      setTimeout(() => {
        navigate('/notices');
      }, 2000);
    } catch (err) {
      setError('❌ ' + (err.response?.data?.error || 'Error posting notice'));
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'General',
    'Registrar Office',
    'Academic Affairs',
    'Student Affairs',
    'Finance',
    'IT Department',
    'Admissions',
    'Faculty of Engineering',
    'Faculty of Business Administration',
    'Faculty of Medicine',
    'Faculty of Education',
    'Faculty of Law',
    'Faculty of Social Sciences',
    'Faculty of Natural Sciences'
  ];

  const audiences = ['students', 'staff', 'faculty', 'alumni', 'all'];
  const locations = ['main', 'library', 'cafeteria', 'engineering', 'medicine', 'all'];

  return (
    <>
      <div className="form-page">
        <div className="container">
          <div className="form-container enhanced-form">
            <h1>📝 Post a New Notice</h1>
            <p className="form-subtitle">Share important updates with the UMU community</p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              {/* SECTION 1: BASIC INFORMATION */}
              <fieldset className="form-section">
                <legend>📋 Basic Information</legend>

                <div className="form-group">
                  <label htmlFor="title">Notice Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter a clear, concise title"
                    maxLength="100"
                  />
                  <div className="hint-text">{formData.title.length}/100 characters</div>
                </div>

                <div className="form-group">
                  <label htmlFor="content">Notice Content *</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    placeholder="Provide detailed information about the notice..."
                  />
                  <div className="hint-text">{formData.content.length} characters</div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="priority">Priority Level</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🔴 High</option>
                      <option value="urgent">🚨 Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <div className="hint-text">Notice will be archived after this date</div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tags">Tags (comma-separated)</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g., exam, important, urgent"
                    />
                  </div>
                </div>
              </fieldset>

              {/* SECTION 2: AUTHOR INFORMATION */}
              <fieldset className="form-section">
                <legend>👤 Author Information</legend>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Department/Office *</label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactEmail">Contact Email</label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone">Contact Phone Number</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+256 ..."
                  />
                </div>
              </fieldset>

              {/* SECTION 3: VISIBILITY & ACCESS */}
              <fieldset className="form-section">
                <legend>👁️ Visibility & Access</legend>

                <div className="form-group">
                  <label htmlFor="visibility">Visibility Status</label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="published">📢 Published</option>
                    <option value="archived">📦 Archived</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Audience</label>
                  <div className="checkbox-group">
                    {audiences.map(audience => (
                      <label key={audience} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="targetAudience"
                          value={audience}
                          checked={formData.targetAudience.includes(audience)}
                          onChange={handleChange}
                        />
                        {audience.charAt(0).toUpperCase() + audience.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Display Locations</label>
                  <div className="checkbox-group">
                    {locations.map(location => (
                      <label key={location} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="displayLocation"
                          value={location}
                          checked={formData.displayLocation.includes(location)}
                          onChange={handleChange}
                        />
                        {location.charAt(0).toUpperCase() + location.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>

              {/* SECTION 4: ATTACHMENTS */}
              <fieldset className="form-section">
                <legend>📎 Attachments</legend>

                <div className="form-group">
                  <label htmlFor="thumbnailImage">Thumbnail Image (for preview)</label>
                  <input
                    type="file"
                    id="thumbnailImage"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />
                  {formData.thumbnailImage && (
                    <div className="thumbnail-preview">
                      <img src={formData.thumbnailImage} alt="Thumbnail preview" />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="attachments">Upload Documents & Images</label>
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    onChange={handleAttachmentChange}
                  />
                  <div className="hint-text">Supported: PDF, Word, Excel, Images</div>
                </div>

                {attachments.length > 0 && (
                  <div className="attachments-list">
                    <h4>Attached Files:</h4>
                    {attachments.map((att, idx) => (
                      <div key={idx} className="attachment-item">
                        <span>📄 {att.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeAttachment(idx)}
                          className="btn-remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="links">External Links (one per line)</label>
                  <textarea
                    id="links"
                    name="links"
                    value={formData.links}
                    onChange={handleChange}
                    placeholder="https://example.com/form&#10;https://example.com/resource"
                    rows="4"
                  />
                </div>
              </fieldset>

              {/* SECTION 5: ADDITIONAL OPTIONS */}
              <fieldset className="form-section">
                <legend>⚙️ Additional Options</legend>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="downloadOption"
                      checked={formData.downloadOption}
                      onChange={handleChange}
                    />
                    ✓ Allow users to download as PDF
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="comments"
                      checked={formData.comments}
                      onChange={handleChange}
                    />
                    ✓ Allow user comments and feedback
                  </label>
                </div>
              </fieldset>

              {/* FORM ACTIONS */}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '⏳ Posting...' : '✓ Post Notice'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate('/notices')}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}