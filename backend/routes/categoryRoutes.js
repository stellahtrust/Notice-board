const express = require('express');

const router = express.Router();

const categories = [
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
];

router.get('/', (req, res) => {
  res.json(categories);
});

module.exports = router;