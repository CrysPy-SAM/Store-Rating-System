import React, { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';

const StatsCards = () => {
  const [stats, setStats] = useState({ totalUsers:0, totalStores:0, totalRatings:0 });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try {
      const res = await userAPI.getDashboardStats();
      setStats(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="stats-grid">
      <div className="stat-card"><h3>Total Users</h3><div className="stat-value">{stats.totalUsers}</div></div>
      <div className="stat-card"><h3>Total Stores</h3><div className="stat-value">{stats.totalStores}</div></div>
      <div className="stat-card"><h3>Total Ratings</h3><div className="stat-value">{stats.totalRatings}</div></div>
    </div>
  );
};

export default StatsCards;
