import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [configurations, setConfigurations] = useState([]);
  const [publicConfigurations, setPublicConfigurations] = useState([]);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use refs to track state changes
  const isInitialMount = useRef(true);
  const hasLoadedConfigs = useRef(false);
  const prevIsAuthenticated = useRef(isAuthenticated);

  // Load public configurations on initial render
  useEffect(() => {
    if (isInitialMount.current) {
      getPublicConfigurations();
      isInitialMount.current = false;
    }
  }, []);

  // Load user configurations when authenticated
  useEffect(() => {
    // Only fetch configurations if authentication state changed from false to true
    // or if we haven't loaded configurations yet
    if (isAuthenticated && 
        (!prevIsAuthenticated.current || !hasLoadedConfigs.current)) {
      getUserConfigurations();
      hasLoadedConfigs.current = true;
    } else if (!isAuthenticated && prevIsAuthenticated.current) {
      // Clear configurations when logging out
      setConfigurations([]);
      hasLoadedConfigs.current = false;
    }
    
    // Update previous authentication state
    prevIsAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  // Get user configurations
  const getUserConfigurations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/configurations');
      setConfigurations(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch configurations');
      setLoading(false);
    }
  };

  // Get public configurations
  const getPublicConfigurations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/configurations/public');
      setPublicConfigurations(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch public configurations');
      setLoading(false);
    }
  };

  // Get configuration by ID
  const getConfigurationById = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/configurations/${id}`);
      setCurrentConfig(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch configuration');
      setLoading(false);
      throw err;
    }
  };

  // Get configuration by shareable link
  const getConfigurationByLink = async (link) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/configurations/share/${link}`);
      setCurrentConfig(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch configuration');
      setLoading(false);
      throw err;
    }
  };

  // Create new configuration
  const createConfiguration = async (configData) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/configurations', configData);
      setConfigurations([...configurations, res.data.data]);
      setCurrentConfig(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create configuration');
      setLoading(false);
      throw err;
    }
  };

  // Update configuration
  const updateConfiguration = async (id, configData) => {
    try {
      setLoading(true);
      const res = await axios.put(`/api/configurations/${id}`, configData);
      
      // Update configurations list
      setConfigurations(
        configurations.map(config => 
          config._id === id ? res.data.data : config
        )
      );
      
      // Update current config if it's the one being edited
      if (currentConfig && currentConfig._id === id) {
        setCurrentConfig(res.data.data);
      }
      
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update configuration');
      setLoading(false);
      throw err;
    }
  };

  // Revert to a previous version
  const revertToVersion = async (id, versionIndex) => {
    try {
      setLoading(true);
      const res = await axios.put(`/api/configurations/${id}/revert/${versionIndex}`);
      
      // Update configurations list
      setConfigurations(
        configurations.map(config => 
          config._id === id ? res.data.data : config
        )
      );
      
      // Update current config if it's the one being edited
      if (currentConfig && currentConfig._id === id) {
        setCurrentConfig(res.data.data);
      }
      
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to revert configuration');
      setLoading(false);
      throw err;
    }
  };

  // Delete configuration
  const deleteConfiguration = async (id) => {
    try {
      setLoading(true);
      
      // Make the API call to delete the configuration
      const response = await axios.delete(`/api/configurations/${id}`);
      
      if (response.data.success) {
        // Remove from configurations list
        setConfigurations(
          configurations.filter(config => config._id !== id)
        );
        
        // Clear current config if it's the one being deleted
        if (currentConfig && currentConfig._id === id) {
          setCurrentConfig(null);
        }
      } else {
        throw new Error(response.data.error || 'Failed to delete configuration');
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error in deleteConfiguration:', err);
      setError(err.response?.data?.error || err.message || 'Failed to delete configuration');
      setLoading(false);
      throw err;
    }
  };

  // Calculate costs for a configuration
  const calculateCosts = async (laaSOptions) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/pricing/calculate', { laaSOptions });
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to calculate costs');
      setLoading(false);
      throw err;
    }
  };

  // Clear errors
  const clearErrors = () => {
    setError(null);
  };

  return (
    <ConfigContext.Provider
      value={{
        configurations,
        publicConfigurations,
        currentConfig,
        loading,
        error,
        getUserConfigurations,
        getPublicConfigurations,
        getConfigurationById,
        getConfigurationByLink,
        createConfiguration,
        updateConfiguration,
        revertToVersion,
        deleteConfiguration,
        calculateCosts,
        clearErrors
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
