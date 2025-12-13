// src/App.js - FINAL COMPLETE FIX
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public components
import Login from './components/Common/Login';
import Signup from './components/Common/Signup';

// Admin components - DIRECT IMPORT (no AdminDashboard wrapper)
import StatsCards from './components/Admin/StatsCards';
import UserList from './components/Admin/UserList';
import StoreList from './components/Admin/StoreList';
import CreateUser from './components/Admin/CreateUser';
import CreateStore from './components/Admin/CreateStore';

// Common components
import UpdatePassword from './components/Common/UpdatePassword';

// User components
import StoreListUser from './components/User/StoreListUser';

// Store Owner components
import StoreDashboard from './components/Store/Dashboard';

// ==================================================================
// ADMIN LAYOUT - Built directly in App.js (NO separate Dashboard.js)
// ==================================================================
const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-wrapper">
      {/* Admin Header */}
      <div className="dashboard-header admin-header">
        <div className="header-content">
          <div className="header-left">
            <span className="dashboard-icon">👨‍💼</span>
            <h1>Admin Dashboard</h1>
          </div>
          <div className="header-right">
            <span className="welcome-badge">ADMIN</span>
            <span className="user-name">Welcome, {user?.name || 'Main System Admin'}</span>
            <button className="btn btn-danger" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <a href="/admin/dashboard" className="nav-btn">
            📊 Dashboard
          </a>
          <a href="/admin/users" className="nav-btn">
            👥 Users
          </a>
          <a href="/admin/stores" className="nav-btn">
            🏪 Stores
          </a>
          <a href="/admin/create-user" className="nav-btn nav-btn-success">
            ➕ Create User
          </a>
          <a href="/admin/create-store" className="nav-btn nav-btn-success">
            ➕ Create Store
          </a>
          <a href="/admin/update-password" className="nav-btn nav-btn-secondary">
            🔐 Update Password
          </a>
        </nav>

        {/* Admin Content - ONLY Admin Components */}
        <div className="dashboard-content">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StatsCards />} />
            <Route path="users" element={<UserList />} />
            <Route path="stores" element={<StoreList />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="create-store" element={<CreateStore />} />
            <Route path="update-password" element={<UpdatePassword />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// ==================================================================
// USER LAYOUT
// ==================================================================
const UserLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header user-header">
        <div className="header-content">
          <div className="header-left">
            <span className="dashboard-icon">👤</span>
            <h1>User Dashboard</h1>
          </div>
          <div className="header-right">
            <span className="welcome-badge user-badge">USER</span>
            <span className="user-name">Welcome, {user?.name}</span>
            <button className="btn btn-danger" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <a href="/user/dashboard" className="nav-btn">
            🏪 Browse Stores
          </a>
          <a href="/user/update-password" className="nav-btn nav-btn-secondary">
            🔐 Update Password
          </a>
        </nav>

        <div className="dashboard-content">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StoreListUser />} />
            <Route path="update-password" element={<UpdatePassword />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

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

          {/* ========== ADMIN ROUTES (Using AdminLayout - NOT AdminDashboard) ========== */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminLayout />
              </PrivateRoute>
            }
          />

          {/* ========== USER ROUTES ========== */}
          <Route
            path="/user/*"
            element={
              <PrivateRoute roles={['user']}>
                <UserLayout />
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