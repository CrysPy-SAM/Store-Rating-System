// frontend/src/components/Admin/Dashboard.js
// ✅ COMPLETE ADMIN DASHBOARD - NO STORE OWNER CODE
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatsCards from './StatsCards';
import UserList from './UserList';
import StoreList from './StoreList';
import CreateUser from './CreateUser';
import CreateStore from './CreateStore';
import UpdatePassword from '../Common/UpdatePassword';

const AdminDashboard = () => {
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

export default AdminDashboard;