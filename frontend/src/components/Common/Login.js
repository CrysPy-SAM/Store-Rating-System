import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await login(form);
      const role = res.user.role;
      if (role === 'admin') nav('/admin/dashboard');
      else if (role === 'store_owner') nav('/store/dashboard');
      else nav('/user/dashboard');
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={submit}>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>
          {err && <div className="error-message">{err}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading?'Logging in...':'Login'}</button>
        </form>
        <div className="auth-link">Don't have account? <Link to="/signup">Sign up</Link></div>
      </div>
    </div>
  );
};

export default Login;
