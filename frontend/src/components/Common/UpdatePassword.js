import React, { useState } from 'react';
import { authAPI } from '../../services/api';

const UpdatePassword = () => {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(form.newPassword)) e.newPassword='New password invalid';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword='Passwords do not match';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setErrors({}); setSuccess('');
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setLoading(true);
    try {
      await authAPI.updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess('Password updated');
      setForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Update failed' });
    } finally { setLoading(false); }
  };

  return (
    <div className="card">
      <h2>Update Password</h2>
      <form onSubmit={submit}>
        <div className="form-group"><label>Current Password</label><input name="currentPassword" type="password" required value={form.currentPassword} onChange={e=>setForm({...form, currentPassword:e.target.value})}/></div>
        <div className="form-group"><label>New Password</label><input name="newPassword" type="password" required value={form.newPassword} onChange={e=>setForm({...form, newPassword:e.target.value})}/>{errors.newPassword && <div className="error-message">{errors.newPassword}</div>}</div>
        <div className="form-group"><label>Confirm New Password</label><input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={e=>setForm({...form, confirmPassword:e.target.value})}/>{errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}</div>
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        {success && <div style={{color:'green'}}>{success}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
      </form>
    </div>
  );
};

export default UpdatePassword;
