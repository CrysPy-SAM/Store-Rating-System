// frontend/src/components/Store/Dashboard.js - COMPLETE WITH USER DETAILS
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

  const RatingsView = () => {
    const renderStars = (rating) => {
      return '⭐'.repeat(Math.round(Number(rating)));
    };

    const getRatingColor = (rating) => {
      if (rating >= 4) return '#11998e';
      if (rating >= 3) return '#ffc107';
      return '#eb3349';
    };

    return (
      <div className="ratings-dashboard">
        {/* Summary Cards */}
        <div className="stats-grid">
          <div className="rating-summary-card">
            <h2>📊 Store Performance</h2>
            <div className="average-rating">
              <span className="rating-label">Average Rating</span>
              <div className="rating-value">
                <span className="rating-number" style={{ color: getRatingColor(avg) }}>
                  {Number(avg).toFixed(1)}
                </span>
                <span className="rating-stars">
                  {renderStars(avg)}
                </span>
              </div>
              <span className="rating-count">{ratings.length} total ratings</span>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeftColor: '#667eea' }}>
            <h3>Total Reviews</h3>
            <div className="stat-value" style={{ color: '#667eea' }}>
              {ratings.length}
            </div>
            <p style={{ marginTop: '8px', color: '#999', fontSize: '14px' }}>
              Customer Ratings
            </p>
          </div>

          <div className="stat-card" style={{ borderLeftColor: '#11998e' }}>
            <h3>5-Star Ratings</h3>
            <div className="stat-value" style={{ color: '#11998e' }}>
              {ratings.filter(r => r.rating === 5).length}
            </div>
            <p style={{ marginTop: '8px', color: '#999', fontSize: '14px' }}>
              Excellent Reviews
            </p>
          </div>
        </div>

        {/* Ratings Table */}
        <div className="card">
          <h3>Customer Ratings & Reviews</h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            View all customers who have rated your store along with their details
          </p>

          {loading ? (
            <div className="loading-state">Loading ratings...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : ratings.length === 0 ? (
            <div className="empty-state">
              <p>No ratings yet</p>
              <small>Your store hasn't received any ratings from users yet.</small>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Rating</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((r, idx) => (
                    <tr key={r.id || `rating-${idx}`}>
                      <td>
                        <strong>{r.name}</strong>
                      </td>
                      <td>
                        <a href={`mailto:${r.email}`} style={{ color: '#667eea' }}>
                          {r.email}
                        </a>
                      </td>
                      <td>{r.address}</td>
                      <td>
                        <span 
                          className="rating-badge" 
                          style={{ 
                            background: getRatingColor(r.rating),
                            color: 'white'
                          }}
                        >
                          {r.rating} ⭐
                        </span>
                        <span style={{ marginLeft: '8px', fontSize: '1.2rem' }}>
                          {renderStars(r.rating)}
                        </span>
                      </td>
                      <td>
                        {new Date(r.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        {ratings.length > 0 && (
          <div className="card">
            <h3>Rating Distribution</h3>
            <div style={{ marginTop: '20px' }}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = ratings.filter(r => r.rating === star).length;
                const percentage = ((count / ratings.length) * 100).toFixed(1);
                return (
                  <div key={star} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    gap: '12px'
                  }}>
                    <span style={{ minWidth: '60px', fontWeight: '600' }}>
                      {star} ⭐
                    </span>
                    <div style={{ 
                      flex: 1, 
                      height: '24px', 
                      background: '#e1e8ed', 
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${percentage}%`,
                        background: getRatingColor(star),
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ minWidth: '80px', color: '#666' }}>
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-wrapper">
      {/* Store Owner Header */}
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