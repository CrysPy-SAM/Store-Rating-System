import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      // ✅ Normalize role on load
      if (savedUser && savedUser.role) {
        savedUser.role = savedUser.role.toLowerCase();
      }
      return savedUser;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      
      console.log('📥 Login API Response:', res.data);
      
      // ✅ Normalize role before saving
      const userData = {
        ...res.data.user,
        role: (res.data.user.role || '').toLowerCase()
      };
      
      console.log('💾 Saving user data:', userData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { ...res.data, user: userData };
    } catch (error) {
      console.error('❌ Login failed in AuthContext:', error);
      throw error;
    }
  };

  const signup = async (data) => {
    try {
      const res = await authAPI.signup(data);
      
      console.log('📥 Signup API Response:', res.data);
      
      // ✅ Normalize role before saving
      const userData = {
        ...res.data.user,
        role: (res.data.user.role || 'user').toLowerCase()
      };
      
      console.log('💾 Saving user data:', userData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { ...res.data, user: userData };
    } catch (error) {
      console.error('❌ Signup failed in AuthContext:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};