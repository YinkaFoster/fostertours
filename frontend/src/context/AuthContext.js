import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const checkAuth = useCallback(async () => {
    try {
      // Try cookie-based auth first
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
      if (token) {
        localStorage.removeItem('token');
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password }, {
        withCredentials: true
      });
      const { access_token, user: userData } = response.data;
      console.log('Login successful, setting token and user', userData);
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password, name, phone) => {
    try {
      const response = await axios.post(`${API}/auth/register`, { email, password, name, phone }, {
        withCredentials: true
      });
      const { access_token, user: userData } = response.data;
      console.log('Registration successful, setting token and user', userData);
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Direct Google OAuth login - sends credential to backend
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const googleLogin = async (credential) => {
    try {
      console.log('Google login: Sending credential to backend...');
      const response = await axios.post(`${API}/auth/google`, { credential }, {
        withCredentials: true
      });
      const { access_token, user: userData } = response.data;
      console.log('Google login successful:', userData);
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Google login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
