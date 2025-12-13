import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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
    <div>
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <span>Welcome, {user?.name}</span>
          <button className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="container">
        <div style={{display:'flex', gap:10, margin:'16px 0'}}>
          <Link to="/admin/dashboard" className="btn btn-primary">Dashboard</Link>
          <Link to="/admin/users" className="btn btn-primary">Users</Link>
          <Link to="/admin/stores" className="btn btn-primary">Stores</Link>
          <Link to="/admin/create-user" className="btn btn-success">Create User</Link>
          <Link to="/admin/create-store" className="btn btn-success">Create Store</Link>
          <Link to="/admin/update-password" className="btn btn-secondary">Update Password</Link>
        </div>

        <Routes>
          <Route path="/dashboard" element={<StatsCards/>} />
          <Route path="/users" element={<UserList/>} />
          <Route path="/stores" element={<StoreList/>} />
          <Route path="/create-user" element={<CreateUser/>} />
          <Route path="/create-store" element={<CreateStore/>} />
          <Route path="/update-password" element={<UpdatePassword/>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
