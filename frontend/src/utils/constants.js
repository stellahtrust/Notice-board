export const CATEGORIES = [
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

export const PRIORITIES = [
  { value: 'low', label: 'Low', icon: '🟢' },
  { value: 'medium', label: 'Medium', icon: '🟡' },
  { value: 'high', label: 'High', icon: '🔴' },
  { value: 'urgent', label: 'Urgent', icon: '🚨' }
];

export const USER_ROLES = {
  admin: 'Administrator',
  faculty: 'Faculty/Staff',
  student: 'Student',
  public: 'Public/Alumni'
};

export const VISIBILITY_OPTIONS = [
  { value: 'internal', label: 'Internal (UMU Only)', icon: '🔒' },
  { value: 'public', label: 'Public', icon: '🌐' },
  { value: 'students_only', label: 'Students Only', icon: '👥' },
  { value: 'faculty_only', label: 'Faculty Only', icon: '👨‍🏫' }
];