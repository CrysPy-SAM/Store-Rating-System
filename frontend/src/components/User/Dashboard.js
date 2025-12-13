import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StoreListUser from './StoreListUser';
import UpdatePassword from '../Common/UpdatePassword';

const UserDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <span>Welcome, {user?.name}</span>
          <button className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="container">
        <div style={{ margin:'16px 0' }}>
          <Link to="/user/dashboard" className="btn btn-primary">Stores</Link>
          <Link to="/user/update-password" className="btn btn-secondary">Update Password</Link>
        </div>

        <Routes>
          <Route path="/dashboard" element={<StoreListUser/>} />
          <Route path="/update-password" element={<UpdatePassword/>} />
        </Routes>
      </div>
    </div>
  );
};

export default UserDashboard;
