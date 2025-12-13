// frontend/src/components/User/Dashboard.js - COMPLETELY SEPARATE
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StoreListUser from './StoreListUser';
import UpdatePassword from '../Common/UpdatePassword';

const UserDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-wrapper">
      {/* User Header - SEPARATE */}
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

      {/* User Navigation */}
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <a href="/user/dashboard" className="nav-btn">
            🏪 Browse Stores
          </a>
          <a href="/user/update-password" className="nav-btn nav-btn-secondary">
            🔐 Update Password
          </a>
        </nav>

        {/* User Content */}
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

export default UserDashboard;