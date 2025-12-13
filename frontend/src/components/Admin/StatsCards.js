// frontend/src/components/Admin/StatsCards.js
// ✅ CORRECT VERSION - Only shows admin statistics
import React, { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';

const StatsCards = () => {
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalStores: 0, 
    totalRatings: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userAPI.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        Loading statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        {error}
      </div>
    );
  }

  return (
    <div className="stats-grid">
      <div className="stat-card" style={{ borderLeftColor: '#667eea' }}>
        <h3>Total Users</h3>
        <div className="stat-value" style={{ color: '#667eea' }}>
          {stats.totalUsers}
        </div>
        <p style={{ marginTop: '8px', color: '#999', fontSize: '14px' }}>
          Registered Users
        </p>
      </div>

      <div className="stat-card" style={{ borderLeftColor: '#11998e' }}>
        <h3>Total Stores</h3>
        <div className="stat-value" style={{ color: '#11998e' }}>
          {stats.totalStores}
        </div>
        <p style={{ marginTop: '8px', color: '#999', fontSize: '14px' }}>
          Active Stores
        </p>
      </div>

      <div className="stat-card" style={{ borderLeftColor: '#ffc107' }}>
        <h3>Total Ratings</h3>
        <div className="stat-value" style={{ color: '#ffc107' }}>
          {stats.totalRatings}
        </div>
        <p style={{ marginTop: '8px', color: '#999', fontSize: '14px' }}>
          Customer Reviews
        </p>
      </div>
    </div>
  );
};

export default StatsCards;