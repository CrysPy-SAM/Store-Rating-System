// frontend/src/components/Store/Dashboard.js - COMPLETELY SEPARATE
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { storeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import UpdatePassword from '../Common/UpdatePassword';

const StoreDashboard = () => {
  const { user, logout } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRatings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await storeAPI.getMyRatings();
      if (res.data.ratings) {
        setRatings(res.data.ratings);
        setAvg(res.data.averageRating || 0);
      } else if (Array.isArray(res.data)) {
        setRatings(res.data);
        const a = res.data.length 
          ? (res.data.reduce((s, r) => s + (r.rating || 0), 0) / res.data.length).toFixed(2) 
          : 0;
        setAvg(a);
      }
    } catch (err) {
      console.error('Error loading ratings:', err);
      setError(err.response?.data?.message || 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRatings();
  }, []);

  const RatingsView = () => (
    <div className="ratings-dashboard">
      <div className="rating-summary-card">
        <h2>📊 Store Performance</h2>
        <div className="average-rating">
          <span className="rating-label">Average Rating</span>
          <div className="rating-value">
            <span className="rating-number">{avg}</span>
            <span className="rating-stars">{'⭐'.repeat(Math.round(Number(avg)))}</span>
          </div>
          <span className="rating-count">{ratings.length} total ratings</span>
        </div>
      </div>

      <div className="card">
        <h3>Recent Ratings</h3>
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : ratings.length ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Rating</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r, idx) => (
                  <tr key={r.id || `rating-${idx}`}>
                    <td>{r.name}</td>
                    <td>
                      <span className="rating-badge">
                        {r.rating} ⭐
                      </span>
                    </td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No ratings yet</p>
            <small>Your store hasn't received any ratings from users.</small>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-wrapper">
      {/* Store Owner Header - SEPARATE */}
      <div className="dashboard-header store-header">
        <div className="header-content">
          <div className="header-left">
            <span className="dashboard-icon">🏪</span>
            <h1>Store Owner Dashboard</h1>
          </div>
          <div className="header-right">
            <span className="welcome-badge store-badge">STORE OWNER</span>
            <span className="user-name">Welcome, {user?.name || 'Store Owner'}</span>
            <button className="btn btn-danger" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Store Owner Navigation */}
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <a href="/store/dashboard" className="nav-btn">
            📊 Ratings Dashboard
          </a>
          <a href="/store/update-password" className="nav-btn nav-btn-secondary">
            🔐 Update Password
          </a>
        </nav>

        {/* Store Owner Content */}
        <div className="dashboard-content">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RatingsView />} />
            <Route path="update-password" element={<UpdatePassword />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;