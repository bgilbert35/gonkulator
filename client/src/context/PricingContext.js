import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const PricingContext = createContext();

export const PricingProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use refs to track state changes
  const isInitialMount = useRef(true);
  const hasLoadedPricing = useRef(false);
  const prevUser = useRef(null);

  // Load pricing data on initial render and when user changes
  useEffect(() => {
    // On initial mount or if pricing data hasn't been loaded yet
    if (isInitialMount.current || !hasLoadedPricing.current) {
      getPricing();
      isInitialMount.current = false;
      hasLoadedPricing.current = true;
    } 
    // Only reload pricing if user changes from null to a value (login)
    // or from a value to a different value (user switch)
    else if (
      (user && !prevUser.current) || 
      (user && prevUser.current && user.id !== prevUser.current.id)
    ) {
      getPricing();
    }
    
    // Update previous user reference
    prevUser.current = user;
  }, [user]);

  // Get pricing data
  const getPricing = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/pricing');
      setPricing(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch pricing data');
      setLoading(false);
    }
  };

  // Update pricing (admin only)
  const updatePricing = async (pricingData) => {
    try {
      setLoading(true);
      const res = await axios.put('/api/pricing', pricingData);
      setPricing(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update pricing data');
      setLoading(false);
      throw err;
    }
  };

  // Calculate costs for a configuration
  const calculateCosts = async (laaSOptions) => {
    try {
      setLoading(true);
      console.log('Sending calculate costs request with options:', laaSOptions);
      
      let res;
      
      // Use the authenticated axios instance for all authenticated users to get WWT costs
      if (user) {
        console.log('Using authenticated request for user');
        res = await axios.post('/api/pricing/calculate', { laaSOptions });
      } else {
        // For unauthenticated users, use unauthenticated request (WWT costs will be filtered out server-side)
        console.log('Using unauthenticated request');
        const axiosInstance = axios.create();
        delete axiosInstance.defaults.headers.common['Authorization'];
        res = await axiosInstance.post('/api/pricing/calculate', { laaSOptions });
      }
      
      console.log('Received calculate costs response:', res.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      console.error('Error calculating costs:', err);
      setError(err.response?.data?.error || 'Failed to calculate costs');
      setLoading(false);
      throw err;
    }
  };

  // Determine environment size based on resources
  const determineEnvironmentSize = (vCPU, memory, storage) => {
    if (!pricing) return 'Unknown';
    
    const { environmentSizeDefinitions } = pricing;
    
    if (
      vCPU > environmentSizeDefinitions.medium.vCPU.upperLimit ||
      memory > environmentSizeDefinitions.medium.memory.upperLimit ||
      storage > environmentSizeDefinitions.medium.storage.upperLimit
    ) {
      return 'Large';
    } else if (
      vCPU > environmentSizeDefinitions.small.vCPU.upperLimit ||
      memory > environmentSizeDefinitions.small.memory.upperLimit ||
      storage > environmentSizeDefinitions.small.storage.upperLimit
    ) {
      return 'Medium';
    } else {
      return 'Small';
    }
  };

  // Get default LaaS options
  const getDefaultLaaSOptions = () => {
    return [
      {
        name: 'Sandbox',
        quantity: 1,
        vCPU: 12,
        memory: 64,
        storage: 1024
      },
      {
        name: 'Developer Machines',
        quantity: 2,
        vCPU: 4,
        memory: 8,
        storage: 256
      },
      {
        name: 'Custom System',
        quantity: 0,
        vCPU: 0,
        memory: 0,
        storage: 0
      }
    ];
  };

  // Clear errors
  const clearErrors = () => {
    setError(null);
  };

  return (
    <PricingContext.Provider
      value={{
        pricing,
        loading,
        error,
        getPricing,
        updatePricing,
        calculateCosts,
        determineEnvironmentSize,
        getDefaultLaaSOptions,
        clearErrors
      }}
    >
      {children}
    </PricingContext.Provider>
  );
};
