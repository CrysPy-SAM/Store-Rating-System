import React, { useEffect, useState, useCallback } from 'react';
import { storeAPI, ratingAPI } from '../../services/api';

const RatingStars = ({ value, onChange }) => {
  const stars = [1,2,3,4,5];
  return (
    <div className="rating-input">
      {stars.map(s => (
        <button key={s} type="button" onClick={() => onChange(s)} className={s <= value ? 'active' : ''} aria-label={`Rate ${s}`} >
          ★
        </button>
      ))}
    </div>
  );
};

const StoreCard = ({ store, onSubmit }) => {
  const [rating, setRating] = useState(store.user_rating || 0);

  useEffect(()=> setRating(store.user_rating || 0), [store.user_rating]);

  return (
    <div className="store-card">
      <h3>{store.name}</h3>
      <p>{store.address}</p>
      <p>Average: <span className="rating-stars">{'★'.repeat(Math.round(store.rating || 0))}{'☆'.repeat(5 - Math.round(store.rating || 0))}</span></p>

      <div>
        <div>Your Rating: {rating ? `${rating}/5` : 'Not rated'}</div>
        <RatingStars value={rating} onChange={setRating} />
        <div style={{ marginTop:8 }}>
          <button className="btn btn-success" onClick={() => onSubmit(store.id, rating)} disabled={!rating}>Submit/Update</button>
        </div>
      </div>
    </div>
  );
};

const StoreListUser = () => {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name:'', address:'' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await storeAPI.getStores(filters);
      setStores(res.data);
    } catch (err) {
      console.error('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const submitRating = async (storeId, rating) => {
    if (!rating) return alert('Choose rating first');
    try {
      await ratingAPI.submitRating({ storeId, rating });
      alert('Rating submitted');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Submit failed');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Stores</h2>
        <div className="search-bar" style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input placeholder="Name" value={filters.name} onChange={e=>setFilters({...filters, name:e.target.value})} />
          <input placeholder="Address" value={filters.address} onChange={e=>setFilters({...filters, address:e.target.value})} />
          <button className="btn btn-primary" onClick={load}>Search</button>
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="store-grid">
            {stores.map(s => <StoreCard key={s.id} store={s} onSubmit={submitRating} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreListUser;
