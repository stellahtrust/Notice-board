import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NoticeProvider } from './context/NoticeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateNotice from './pages/CreateNotice';
import NoticeDetail from './pages/NoticeDetail';
import AdminDashboard from './pages/AdminDashboard';
import EditNotice from './pages/EditNotice';
import UserProfile from './pages/UserProfile';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';

import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, token } = useContext(AuthContext);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : null);

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NoticeProvider>
          <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main className="app-main" style={{ flex: 1 }}>
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/notices" element={<Home />} />
                <Route path="/notice/:id" element={<NoticeDetail />} />
                <Route path="/search" element={<SearchResults />} />
                
                {/* AUTH ROUTES */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* PROTECTED ROUTES - FACULTY & ADMIN */}
                <Route 
                  path="/create-notice" 
                  element={
                    <ProtectedRoute requiredRole={['faculty', 'admin']}>
                      <CreateNotice />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/edit-notice/:id" 
                  element={
                    <ProtectedRoute>
                      <EditNotice />
                    </ProtectedRoute>
                  } 
                />

                {/* PROTECTED ROUTES - ADMIN ONLY */}
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* PROTECTED ROUTES - ALL USERS */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } 
                />

                {/* 404 - NOT FOUND */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NoticeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
