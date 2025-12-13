// src/components/User/Dashboard.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StoreListUser from './StoreListUser';
import UpdatePassword from '../Common/UpdatePassword';

const UserDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <div>
          <span style={{ marginRight: '10px' }}>Welcome, {user?.name}</span>
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <Link to="/user/dashboard" className="btn btn-primary">
            Stores
          </Link>
          <Link to="/user/update-password" className="btn btn-secondary">
            Update Password
          </Link>
        </div>

        <Routes>
          <Route path="/dashboard" element={<StoreListUser />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserDashboard;
