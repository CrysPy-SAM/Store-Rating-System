import React from 'react';

const StoreRatings = ({ ratings }) => {
  if (!ratings || ratings.length === 0) return <div>No ratings yet</div>;

  return (
    <div className="card">
      <h3>User Ratings</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((r) => (
              <tr key={r.id || `${r.email}-${r.created_at}`}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.rating}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreRatings;
