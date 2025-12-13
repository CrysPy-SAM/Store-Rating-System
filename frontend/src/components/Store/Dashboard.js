import React, { useEffect, useState } from 'react';
import { storeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import UpdatePassword from '../Common/UpdatePassword';

const StoreDashboard = () => {
  const { user, logout } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await storeAPI.getMyRatings();
      if (res.data.ratings) {
        setRatings(res.data.ratings);
        setAvg(res.data.averageRating || 0);
      } else if (Array.isArray(res.data)) {
        setRatings(res.data);
        // optionally compute avg
        const a = res.data.length ? (res.data.reduce((s,r)=>s + (r.rating||0),0)/res.data.length).toFixed(2) : 0;
        setAvg(a);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Store Owner Dashboard</h1>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <span>{user?.name}</span>
          <button className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Average Rating: <span className="stat-value">{avg}</span></h2>
          <h3>Ratings</h3>
          {loading ? <div>Loading...</div> : (
            ratings.length ? (
              <table>
                <thead><tr><th>User</th><th>Email</th><th>Rating</th><th>Submitted At</th></tr></thead>
                <tbody>
                  {ratings.map(r => (
                    <tr key={r.id || `${r.email}-${r.created_at}`}>
                      <td>{r.name}</td>
                      <td>{r.email}</td>
                      <td>{r.rating}</td>
                      <td>{new Date(r.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div>No ratings yet</div>
          )}
        </div>

        <div style={{marginTop:16}}>
          <UpdatePassword />
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;
