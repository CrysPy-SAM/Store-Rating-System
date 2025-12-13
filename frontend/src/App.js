// src/App.js - FINAL COMPLETE FIX
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public components
import Login from './components/Common/Login';
import Signup from './components/Common/Signup';

// Admin Dashboard - IMPORT THE COMPONENT
import AdminDashboard from './components/Admin/Dashboard';

// User Dashboard
import UserDashboard from './components/User/Dashboard';

// Store Owner Dashboard
import StoreDashboard from './components/Store/Dashboard';

// ==================================================================
// PROTECTED ROUTE
// ==================================================================
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'store_owner') return <Navigate to="/store/dashboard" replace />;
    if (user.role === 'user') return <Navigate to="/user/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ==================================================================
// HOME REDIRECT
// ==================================================================
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based redirect
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'user') return <Navigate to="/user/dashboard" replace />;
  if (user.role === 'store_owner') return <Navigate to="/store/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

// ==================================================================
// MAIN APP COMPONENT
// ==================================================================
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ========== ADMIN ROUTES ========== */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* ========== USER ROUTES ========== */}
          <Route
            path="/user/*"
            element={
              <PrivateRoute roles={['user']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          {/* ========== STORE OWNER ROUTES ========== */}
          <Route
            path="/store/*"
            element={
              <PrivateRoute roles={['store_owner']}>
                <StoreDashboard />
              </PrivateRoute>
            }
          />

          {/* ========== CATCH ALL ========== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;