import React, { useState } from 'react';
import { storeAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CreateStore = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '',        // Store email
    address: '', 
    ownerEmail: '',   // Owner email (separate)
    ownerPassword: '' // Owner password
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const validate = () => {
    const e = {};
    
    // Name validation
    if (form.name.trim().length < 20 || form.name.trim().length > 60) {
      e.name = 'Store name must be between 20 and 60 characters';
    }
    
    // Store email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Invalid store email';
    }
    
    // Owner email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) {
      e.ownerEmail = 'Invalid owner email';
    }
    
    // Check if emails are different
    if (form.email === form.ownerEmail) {
      e.ownerEmail = 'Owner email must be different from store email';
    }
    
    // Address validation
    if (form.address.length > 400) {
      e.address = 'Address must not exceed 400 characters';
    }
    
    // Password validation
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(form.ownerPassword)) {
      e.ownerPassword = 'Password must be 8-16 characters with at least one uppercase letter and one special character';
    }
    
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { 
      setErrors(ve); 
      return; 
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await storeAPI.createStore({
        name: form.name,
        email: form.email,
        address: form.address,
        ownerEmail: form.ownerEmail,
        ownerPassword: form.ownerPassword
      });
      
      alert('Store created successfully! Owner can now login with their email.');
      nav('/admin/stores');
    } catch (err) {
      setErrors({ 
        submit: err.response?.data?.message || 'Failed to create store' 
      });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="card">
      <h2>Create New Store</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Create a new store and its owner account. The owner will be able to login 
        with their email and view ratings.
      </p>
      
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Store Name *</label>
          <input 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            placeholder="Enter store name (20-60 characters)"
            required
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label>Store Email *</label>
          <input 
            type="email"
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            placeholder="Enter store contact email"
            required
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label>Store Address *</label>
          <textarea 
            value={form.address} 
            onChange={e => setForm({...form, address: e.target.value})} 
            placeholder="Enter complete store address (max 400 characters)"
            rows="3"
            required
          />
          {errors.address && <div className="error-message">{errors.address}</div>}
        </div>

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '2px solid #e1e8ed' }} />
        
        <h3 style={{ marginBottom: '16px', color: '#2c3e50' }}>Store Owner Details</h3>

        <div className="form-group">
          <label>Owner Email * (Login Credential)</label>
          <input 
            type="email"
            value={form.ownerEmail} 
            onChange={e => setForm({...form, ownerEmail: e.target.value})} 
            placeholder="Enter owner's email for login"
            required
          />
          {errors.ownerEmail && <div className="error-message">{errors.ownerEmail}</div>}
          <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
            This email will be used by the store owner to login
          </small>
        </div>

        <div className="form-group">
          <label>Owner Password *</label>
          <input 
            type="password"
            value={form.ownerPassword} 
            onChange={e => setForm({...form, ownerPassword: e.target.value})} 
            placeholder="Enter owner's password"
            required
          />
          {errors.ownerPassword && <div className="error-message">{errors.ownerPassword}</div>}
          <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
            8-16 characters, at least 1 uppercase and 1 special character (!@#$%^&*)
          </small>
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button 
            className="btn btn-primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Store...' : 'Create Store'}
          </button>
          <button 
            className="btn btn-secondary" 
            type="button"
            onClick={() => nav('/admin/stores')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStore;