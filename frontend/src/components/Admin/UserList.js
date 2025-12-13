import React, { useEffect, useState, useCallback } from 'react';
import { userAPI } from '../../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name:'', email:'', address:'', role:'' });
  const [sort, setSort] = useState({ field:'name', order:'asc' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortField: sort.field, sortOrder: sort.order };
      const res = await userAPI.getUsers(params);
      setUsers(res.data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSort = (field) => {
    setSort({
      field,
      order: sort.field === field && sort.order === 'asc' ? 'desc' : 'asc',
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <div className="card">
      <h2>Users</h2>

      <div className="filters">
        <input type="text" placeholder="Filter by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input type="text" placeholder="Filter by email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input type="text" placeholder="Filter by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Name {sort.field === 'name' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('email')}>Email {sort.field === 'email' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('address')}>Address {sort.field === 'address' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('role')}>Role {sort.field === 'role' && (sort.order === 'asc' ? '↑' : '↓')}</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td>{user.role}</td>
                  <td>{user.role === 'store_owner' ? <span className="rating-stars">{renderStars(user.rating)}</span> : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
