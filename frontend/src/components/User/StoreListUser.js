import React, { useEffect, useState } from 'react';
import { storeAPI, ratingAPI } from '../../services/api';

const StoreListUser = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const res = await storeAPI.getStores();
      setStores(res.data);
    } catch (err) {
      console.error('Error loading stores', err);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (storeId, rating) => {
    try {
      await ratingAPI.submitRating({ storeId, rating });
      alert('Rating submitted');
      loadStores(); // refresh
    } catch (err) {
      alert('Error submitting rating');
    }
  };

  if (loading) return <div>Loading stores...</div>;

  return (
    <div className="card">
      <h2>Stores</h2>

      {stores.map(store => (
        <div key={store.id} className="store-card">
          <h3>{store.name}</h3>
          <p>{store.address}</p>
          <p>⭐ Rating: {Number(store.rating).toFixed(1)}</p>

          <select
            defaultValue={store.user_rating || ''}
            onChange={(e) => submitRating(store.id, e.target.value)}
          >
            <option value="">Rate store</option>
            {[1,2,3,4,5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default StoreListUser;
