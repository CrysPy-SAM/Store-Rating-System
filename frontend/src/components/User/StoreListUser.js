import React, { useEffect, useState } from 'react';
import { storeAPI, ratingAPI } from '../../services/api';

const StoreListUser = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const res = await storeAPI.getStores();
      setStores(res.data);
    } catch (err) {
      console.error('Error loading stores', err);
      alert('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (storeId, rating) => {
    if (!rating) return;
    
    setSubmitting(storeId);
    try {
      await ratingAPI.submitRating({ storeId, rating: parseInt(rating) });
      alert('Rating submitted successfully!');
      await loadStores(); // Refresh to show updated rating
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(null);
    }
  };

  // Filter stores based on search
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(search.name.toLowerCase()) &&
    store.address.toLowerCase().includes(search.address.toLowerCase())
  );

  // Sort filtered stores
  const sortedStores = [...filteredStores].sort((a, b) => {
    let aVal = a[sort.field];
    let bVal = b[sort.field];
    
    // Handle numeric values (rating)
    if (sort.field === 'rating') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    }
    
    if (sort.order === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const toggleSort = (field) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderStars = (rating) => {
    const numRating = Math.round(Number(rating) || 0);
    return '⭐'.repeat(numRating) + '☆'.repeat(5 - numRating);
  };

  if (loading) {
    return (
      <div className="loading-state">
        Loading stores...
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Browse Stores & Submit Ratings</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Search for stores and rate them from 1 to 5 stars. You can modify your rating anytime.
      </p>

      {/* Search Filters */}
      <div className="filters">
        <input 
          type="text"
          placeholder="🔍 Search by store name" 
          value={search.name} 
          onChange={(e) => setSearch({...search, name: e.target.value})}
        />
        <input 
          type="text"
          placeholder="📍 Search by address" 
          value={search.address} 
          onChange={(e) => setSearch({...search, address: e.target.value})}
        />
      </div>

      {sortedStores.length === 0 ? (
        <div className="empty-state">
          <p>No stores found</p>
          <small>Try adjusting your search filters</small>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
                  Store Name {sort.field === 'name' && (sort.order === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => toggleSort('address')} style={{ cursor: 'pointer' }}>
                  Address {sort.field === 'address' && (sort.order === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => toggleSort('rating')} style={{ cursor: 'pointer' }}>
                  Overall Rating {sort.field === 'rating' && (sort.order === 'asc' ? '↑' : '↓')}
                </th>
                <th>Your Rating</th>
                <th>Rate Store</th>
              </tr>
            </thead>
            <tbody>
              {sortedStores.map(store => (
                <tr key={store.id}>
                  <td>
                    <strong>{store.name}</strong>
                    <br />
                    <small style={{ color: '#666' }}>{store.email}</small>
                  </td>
                  <td>{store.address}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="rating-badge">
                        {Number(store.rating).toFixed(1)} ⭐
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>
                        {renderStars(store.rating)}
                      </span>
                    </div>
                  </td>
                  <td>
                    {store.user_rating ? (
                      <span style={{ 
                        color: '#11998e', 
                        fontWeight: '600',
                        fontSize: '1.1rem'
                      }}>
                        {store.user_rating} ⭐
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>Not rated yet</span>
                    )}
                  </td>
                  <td>
                    <select
                      value={store.user_rating || ''}
                      onChange={(e) => submitRating(store.id, e.target.value)}
                      disabled={submitting === store.id}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '2px solid #e1e8ed',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="">
                        {store.user_rating ? '✏️ Change rating' : '⭐ Rate this store'}
                      </option>
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>
                          {n} ⭐ {store.user_rating === n ? '(current)' : ''}
                        </option>
                      ))}
                    </select>
                    {submitting === store.id && (
                      <small style={{ display: 'block', color: '#666', marginTop: '4px' }}>
                        Submitting...
                      </small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        <strong>💡 Tip:</strong> Click on column headers to sort. You can search stores by name or address, 
        and rate them from 1 to 5 stars. Your rating helps other users make better decisions!
      </div>
    </div>
  );
};

export default StoreListUser;