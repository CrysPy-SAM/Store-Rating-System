import React, { useState } from 'react';
import { userAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
  const [form, setForm] = useState({ name:'', email:'', password:'', address:'', role:'user' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 20 || form.name.trim().length > 60) e.name='Name 20-60 chars';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email='Invalid email';
    if (form.address.length > 400) e.address='Address too long';
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(form.password)) e.password='Password invalid';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setLoading(true);
    try {
      await userAPI.createUser(form);
      alert('User created');
      nav('/admin/users');
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Create failed' });
    } finally { setLoading(false); }
  };

  return (
    <div className="card">
      <h2>Create User</h2>
      <form onSubmit={submit}>
        <div className="form-group"><label>Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>{errors.name && <div className="error-message">{errors.name}</div>}</div>
        <div className="form-group"><label>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>{errors.email && <div className="error-message">{errors.email}</div>}</div>
        <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>{errors.password && <div className="error-message">{errors.password}</div>}</div>
        <div className="form-group"><label>Address</label><textarea value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required/>{errors.address && <div className="error-message">{errors.address}</div>}</div>
        <div className="form-group"><label>Role</label><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="user">User</option><option value="admin">Admin</option><option value="store_owner">Store Owner</option></select></div>
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        <button className="btn btn-primary" disabled={loading}>{loading?'Creating...':'Create User'}</button>
      </form>
    </div>
  );
};

export default CreateUser;
