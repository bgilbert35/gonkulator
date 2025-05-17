import React, { useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const AdminRoute = ({ component: Component }) => {
  const { user, isAuthenticated, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  // If there's an authentication error, redirect to login after a short delay
  useEffect(() => {
    if (error && !loading && !isAuthenticated) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [error, loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <Component />;
};

export default AdminRoute;
