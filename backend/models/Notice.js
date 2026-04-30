const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'Academic Announcements',
      'Exam Schedules & Results',
      'Registration Deadlines',
      'Academic Calendar',
      'Scholarship Circulars',
      'Administrative',
      'University Press Releases',
      'Campus Security Alerts',
      'IT & Maintenance',
      'Staff Events',
      'Student Life',
      'Student Guild & Club News',
      'Career Opportunities',
      'Chapel Announcements',
      'Sports Fixtures',
      'Lost & Found',
      'Public Lectures',
      'Alumni Updates'
    ],
    required: true
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'pending_approval', 'approved', 'rejected'],
    default: 'pending_approval'
  },
  visibility: {
    type: String,
    enum: ['internal', 'published', 'archived'],
    default: 'internal'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // AUTHOR INFO
  department: { type: String, default: 'General' },
  contactEmail: { type: String, default: null },
  contactPhone: { type: String, default: null },

  // VISIBILITY & ACCESS
  targetAudience: [{ 
    type: String, 
    enum: ['students', 'staff', 'faculty', 'alumni', 'all'],
    default: 'all'
  }],
  displayLocation: [{
    type: String,
    enum: ['main', 'library', 'cafeteria', 'engineering', 'medicine', 'all'],
    default: 'main'
  }],

  // ATTACHMENTS
  thumbnailImage: { type: String, default: null },
  attachments: [{ type: String }],
  links: [{ type: String }],

  // ADDITIONAL FIELDS
  tags: [{ type: String }],
  downloadOption: { type: Boolean, default: true },
  comments: { type: Boolean, default: true },
  commentsList: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],

  // DATES
  expiryDate: { type: Date, default: null },
  viewCount: { type: Number, default: 0 },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvalDate: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);