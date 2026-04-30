import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import '../styles/noticecard.css';

export default function NoticeCard({ notice }) {
  const priorityClass = `card-priority-${notice.priority}`;
  const badgeClass = `badge-${notice.priority}`;

  return (
    <Link to={`/notice/${notice._id}`} className="notice-card-link">
      <div className={`card ${priorityClass}`}>
        {/* THUMBNAIL */}
        {notice.thumbnailImage && (
          <div className="card-thumbnail">
            <img src={notice.thumbnailImage} alt={notice.title} />
          </div>
        )}

        <div className="card-content">
          <div className="notice-header">
            <h3 className="notice-title">{notice.title}</h3>
            <span className={`badge ${badgeClass}`}>{notice.priority}</span>
          </div>

          <p className="notice-category">📂 {notice.category}</p>

          <p className="notice-content">{notice.content.substring(0, 150)}...</p>

          <div className="notice-tags">
            {notice.tags && notice.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="small-tag">{tag}</span>
            ))}
            {notice.tags && notice.tags.length > 3 && (
              <span className="small-tag">+{notice.tags.length - 3}</span>
            )}
          </div>

          <div className="notice-meta">
            <span className="notice-author">✍️ {notice.authorName}</span>
            <span className="notice-date">
              ⏱️ {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
            </span>
          </div>

          <div className="notice-footer">
            <span className="notice-views">👁️ {notice.viewCount} views</span>
            <span className="notice-department">🏢 {notice.department || 'UMU'}</span>
            {notice.expiryDate && (
              <span className="notice-expiry">
                📅 {new Date(notice.expiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}