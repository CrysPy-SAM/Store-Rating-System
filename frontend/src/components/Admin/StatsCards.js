import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { storeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import UpdatePassword from '../Common/UpdatePassword';

const StoreRatingsView = () => {
  const [ratings, setRatings] = useState([]);
  const [avg, setAvg] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📡 Fetching ratings...');
      const res = await storeAPI.getMyRatings();
      console.log('✅ Response:', res.data);
      
      if (res.data.ratings) {
        setRatings(res.data.ratings);
        setAvg(res.data.averageRating || 0);
        setTotalRatings(res.data.totalRatings || 0);
      } else if (Array.isArray(res.data)) {
        setRatings(res.data);
        const a = res.data.length 
          ? (res.data.reduce((s,r) => s + (r.rating||0), 0) / res.data.length).toFixed(2) 
          : 0;
        setAvg(a);
        setTotalRatings(res.data.length);
      }
    } catch (err) {
      console.error('❌ Error loading ratings:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load ratings';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const renderStars = (rating) => {
    const filled = Math.round(rating);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#28a745';
    if (rating >= 3.5) return '#ffc107';
    if (rating >= 2.5) return '#fd7e14';
    return '#dc3545';
  };

  if (loading) {
    return <div className="loading">Loading ratings...</div>;
  }

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTopColor: getRatingColor(avg) }}>
          <h3>Average Rating</h3>
          <div className="stat-value" style={{ color: getRatingColor(avg) }}>
            {Number(avg).toFixed(1)}
          </div>
          <div style={{ color: '#ffc107', fontSize: '24px', marginTop: '12px' }}>
            {renderStars(avg)}
          </div>
        </div>
        
        <div className="stat-card" style={{ borderTopColor: '#667eea' }}>
          <h3>Total Ratings</h3>
          <div className="stat-value" style={{ color: '#667eea' }}>
            {totalRatings}
          </div>
          <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
            Customer Reviews
          </p>
        </div>

        <div className="stat-card" style={{ borderTopColor: '#17a2b8' }}>
          <h3>Rating Distribution</h3>
          <div style={{ marginTop: '12px' }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratings.filter(r => Math.round(r.rating) === star).length;
              const percentage = totalRatings ? (count / totalRatings * 100).toFixed(0) : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#666', minWidth: '20px' }}>{star}★</span>
                  <div style={{ 
                    flex: 1, 
                    height: '8px', 
                    background: '#e9ecef', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      background: '#ffc107',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#999', minWidth: '40px', textAlign: 'right' }}>
                    {count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>🎯 Customer Ratings & Reviews</h3>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {!error && (
          ratings.length ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Rating</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((r, idx) => (
                    <tr key={r.id || `rating-${idx}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <strong>{r.name}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="rating-stars">
                            {renderStars(r.rating)}
                          </span>
                          <span style={{ 
                            padding: '4px 12px', 
                            background: getRatingColor(r.rating),
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {r.rating}/5
                          </span>
                        </div>
                      </td>
                      <td style={{ color: '#666' }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN', {
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
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3>No Ratings Yet</h3>
              <p>Your store hasn't received any ratings from customers yet.</p>
              <p style={{ marginTop: '8px' }}>Keep providing great service to get your first rating!</p>
            </div>
          )
        )}
      </div>
    </>
  );
};

const StoreDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <div className="dashboard-header">
        <h1>🏪 Store Owner Dashboard</h1>
        <div className="user-info">
          <span>Welcome, <strong>{user?.name}</strong></span>
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        <div className="nav-tabs">
          <Link to="/store/dashboard" className="btn btn-primary">
            📊 Ratings Dashboard
          </Link>
          <Link to="/store/update-password" className="btn btn-secondary">
            🔒 Update Password
          </Link>
        </div>

        <Routes>
          <Route path="/dashboard" element={<StoreRatingsView />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Routes>
      </div>
    </div>
  );
};

export default StoreDashboard;