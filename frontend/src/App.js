// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './components/Common/Login';
import Signup from './components/Common/Signup';
import AdminDashboard from './components/Admin/Dashboard';
import UserDashboard from './components/User/Dashboard';
import StoreDashboard from './components/Store/Dashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />; // not a loop: unauthenticated -> login
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // safe fallback to user's own dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'store_owner') return <Navigate to="/store/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

/**
 * HomeRedirect:
 * - waits for auth loading to finish and then navigates once to the correct dashboard.
 * - using useEffect avoids causing redirect during render, which can cause loops.
 */
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    // redirect to the proper dashboard based on role
    if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
    else if (user.role === 'store_owner') navigate('/store/dashboard', { replace: true });
    else navigate('/user/dashboard', { replace: true });
    // only run when loading changes or user changes
  }, [loading, user, navigate]);

  // while waiting, you can show a loading state
  return <div>Loading...</div>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Home redirect uses effect-based navigation to avoid render-time loops */}
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/user/*"
        element={
          <PrivateRoute allowedRoles={['user']}>
            <UserDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/store/*"
        element={
          <PrivateRoute allowedRoles={['store_owner']}>
            <StoreDashboard />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
