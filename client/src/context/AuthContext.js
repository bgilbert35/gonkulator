import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Set default headers for all axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Get user data
          const res = await axios.get('/api/auth/me');
          
          setUser(res.data.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error loading user:', err);
          // If token is invalid, clear it
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setIsAuthenticated(false);
          setError(err.response?.data?.error || 'Session expired. Please login again.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Auth context error:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
        setError(err.response?.data?.error || 'An error occurred');
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      console.log('AuthContext: Registering user with data:', userData);
      setLoading(true);
      
      console.log('AuthContext: Making API request to /api/auth/register');
      const res = await axios.post('/api/auth/register', userData);
      console.log('AuthContext: Registration API response:', res.data);
      
      // Don't automatically log in the user after registration
      setLoading(false);
      setError(null);
      
      console.log('AuthContext: Registration successful');
      return {
        success: true,
        message: 'Registration successful! Please log in with your credentials.',
        data: res.data
      };
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      console.error('AuthContext: Error response:', err.response?.data);
      setLoading(false);
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      console.log('AuthContext: Logging in with data:', userData);
      setLoading(true);
      
      // Validate input before sending to server
      if (!userData.username || !userData.password) {
        setLoading(false);
        setError('Please provide both username/email and password');
        throw new Error('Please provide both username/email and password');
      }
      
      console.log('AuthContext: Making API request to /api/auth/login');
      const res = await axios.post('/api/auth/login', userData);
      console.log('AuthContext: Login API response:', res.data);
      
      if (!res.data.success || !res.data.token) {
        setLoading(false);
        setError('Invalid response from server');
        throw new Error('Invalid response from server');
      }
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      console.log('AuthContext: Token saved to localStorage');
      
      // Set default headers for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      console.log('AuthContext: Authorization header set');
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      setError(null);
      
      console.log('AuthContext: Login successful, user authenticated');
      return res.data;
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      console.error('AuthContext: Error response:', err.response?.data);
      setLoading(false);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Remove default headers
      delete axios.defaults.headers.common['Authorization'];
      
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Logout failed');
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/forgot-password', { email });
      setLoading(false);
      setError(null);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to process password reset request');
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    try {
      setLoading(true);
      const res = await axios.put(`/api/auth/reset-password/${resetToken}`, { password });
      setLoading(false);
      setError(null);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to reset password');
      throw err;
    }
  };

  // Clear errors
  const clearErrors = () => {
    setError(null);
  };

  // Fetch all users
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/users');
      console.log('Fetched users:', res.data); // Log the fetched users
      setUsers(res.data.data); // Update the users state with the fetched data
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Failed to fetch users');
      setLoading(false);
    }
  }, []);

 const [users, setUsers] = useState([]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        clearErrors,
        fetchUsers, // Add fetchUsers to the context
        users // Add users to the context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
