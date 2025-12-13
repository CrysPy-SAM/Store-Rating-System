import React, { useEffect, useState, useCallback } from 'react';
import { storeAPI } from '../../services/api';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name:'', email:'', address:'' });
  const [sort, setSort] = useState({ field:'name', order:'asc' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortField: sort.field, sortOrder: sort.order };
      const res = await storeAPI.getStores(params);
      setStores(res.data);
    } catch (err) {
      console.error('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSort = (field) => {
    setSort({ field, order: sort.field === field && sort.order === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="card">
      <h2>Stores</h2>

      <div className="filters">
        <input placeholder="Filter by name" value={filters.name} onChange={(e)=>setFilters({...filters, name:e.target.value})} />
        <input placeholder="Filter by email" value={filters.email} onChange={(e)=>setFilters({...filters, email:e.target.value})} />
        <input placeholder="Filter by address" value={filters.address} onChange={(e)=>setFilters({...filters, address:e.target.value})} />
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={()=>toggleSort('name')}>Name {sort.field === 'name' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                <th onClick={()=>toggleSort('email')}>Email {sort.field === 'email' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                <th onClick={()=>toggleSort('address')}>Address {sort.field === 'address' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                <th onClick={()=>toggleSort('rating')}>Rating {sort.field === 'rating' && (sort.order === 'asc' ? '↑' : '↓')}</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.address}</td>
                  <td>{Math.round(s.rating) || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StoreList;
