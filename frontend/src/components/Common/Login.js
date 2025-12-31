import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const res = await login(form);
      
      console.log('✅ Login Response:', res);
      console.log('✅ User Data:', res.user);
      console.log('✅ User Role:', res.user?.role);

      // ✅ NORMALIZE ROLE (handle both uppercase and lowercase)
      const role = (res.user?.role || '').toLowerCase();
      
      console.log('✅ Normalized Role:', role);

      // Small delay to ensure state is updated
      setTimeout(() => {
        // Redirect based on role
        if (role === 'admin') {
          console.log('🔄 Redirecting to admin dashboard');
          nav('/admin/dashboard', { replace: true });
        } else if (role === 'store_owner') {
          console.log('🔄 Redirecting to store dashboard');
          nav('/store/dashboard', { replace: true });
        } else if (role === 'user') {
          console.log('🔄 Redirecting to user dashboard');
          nav('/user/dashboard', { replace: true });
        } else {
          console.warn('⚠️ Unknown role:', role);
          nav('/', { replace: true });
        }
      }, 100);

    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      setErr(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 Login</h2>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>
          {err && (
            <div className="error-message" style={{ 
              padding: '12px', 
              background: '#fee', 
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {err}
            </div>
          )}
          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;