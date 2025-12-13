import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [form, setForm] = useState({ name:'', email:'', address:'', password:'', confirmPassword:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const nav = useNavigate();

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 20 || form.name.trim().length > 60) e.name='Name 20-60 chars';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email='Invalid email';
    if (form.address.length > 400) e.address='Address too long';
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(form.password)) e.password='Password invalid';
    if (form.password !== form.confirmPassword) e.confirmPassword='Passwords do not match';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setLoading(true); setErrors({});
    try {
      await signup({ name: form.name, email: form.email, address: form.address, password: form.password });
      nav('/user/dashboard');
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Signup failed' });
    } finally { setLoading(false); }
  };

  const change = (e) => { setForm({...form, [e.target.name]: e.target.value}); if (errors[e.target.name]) setErrors({...errors, [e.target.name]: ''}); };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        <form onSubmit={submit}>
          <div className="form-group"><label>Name</label><input name="name" value={form.name} onChange={change} required/>{errors.name && <div className="error-message">{errors.name}</div>}</div>
          <div className="form-group"><label>Email</label><input name="email" type="email" value={form.email} onChange={change} required/>{errors.email && <div className="error-message">{errors.email}</div>}</div>
          <div className="form-group"><label>Address</label><textarea name="address" value={form.address} onChange={change} required/>{errors.address && <div className="error-message">{errors.address}</div>}</div>
          <div className="form-group"><label>Password</label><input name="password" type="password" value={form.password} onChange={change} required/>{errors.password && <div className="error-message">{errors.password}</div>}</div>
          <div className="form-group"><label>Confirm Password</label><input name="confirmPassword" type="password" value={form.confirmPassword} onChange={change} required/>{errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}</div>
          {errors.submit && <div className="error-message">{errors.submit}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading?'Creating...':'Sign Up'}</button>
        </form>
        <div className="auth-link">Already have an account? <Link to="/login">Login</Link></div>
      </div>
    </div>
  );
};

export default Signup;
