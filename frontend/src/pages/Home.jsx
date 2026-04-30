import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NoticeCard from '../components/NoticeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import '../styles/home.css';

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [categories, setCategories] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCategories();
    fetchNotices();
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory, selectedPriority]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPriority) params.priority = selectedPriority;

      const response = await axios.get('/api/notices', { params });
      setNotices(response.data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedPriority('');
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            📌 Uganda Martyrs University
            <span className="hero-subtitle">Notice Board System</span>
          </h1>
          <p className="hero-description">
            Stay updated with the latest announcements, events, and important updates from UMU Nkozi. Your central hub for all university communications.
          </p>
          {user && (user.role === 'admin' || user.role === 'faculty') && (
            <Link to="/create-notice" className="btn btn-primary hero-btn">
              ✍️ Post a Notice
            </Link>
          )}
        </div>
      </div>

      <div className="container notices-section">
        <div className="filters-section">
          <h3>🔍 Filter Notices</h3>
          
          <div className="form-group">
            <label>Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
              <option value="urgent">🚨 Urgent</option>
            </select>
          </div>

          {(selectedCategory || selectedPriority) && (
            <button onClick={handleClearFilters} className="btn btn-ghost" style={{ width: '100%' }}>
              Clear Filters
            </button>
          )}
        </div>

        <div className="notices-list">
          <h2>📰 Latest Notices ({notices.length})</h2>
          
          {loading ? (
            <LoadingSpinner />
          ) : notices.length === 0 ? (
            <div className="no-notices">
              <div className="no-notices-icon">📭</div>
              <p>No notices found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {notices.map((notice) => (
                <NoticeCard key={notice._id} notice={notice} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}