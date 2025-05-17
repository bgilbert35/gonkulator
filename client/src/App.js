import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { PricingProvider } from './context/PricingContext';
import { ConfigProvider } from './context/ConfigContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ConfigurationBuilder from './pages/ConfigurationBuilder';
import ConfigurationDetails from './pages/ConfigurationDetails';
import SharedConfiguration from './pages/SharedConfiguration';
import AdminDashboard from './pages/AdminDashboard';
import PricingSettings from './pages/PricingSettings';
import NotFound from './pages/NotFound';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PricingProvider>
          <ConfigProvider>
            <Router>
              <Header />
              <main style={{ minHeight: 'calc(100vh - 128px)', padding: '20px' }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
                  <Route path="/configuration/builder" element={<ConfigurationBuilder />} />
                  <Route path="/configuration/share/:link" element={<SharedConfiguration />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/dashboard" 
                    element={<PrivateRoute component={Dashboard} />} 
                  />
                  
                  {/* Configuration Details - Public to allow Calculate Cost button to work */}
                  <Route path="/configuration/:id" element={<ConfigurationDetails />} />
                  
                  {/* Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={<AdminRoute component={AdminDashboard} />} 
                  />
                  <Route 
                    path="/admin/pricing" 
                    element={<AdminRoute component={PricingSettings} />} 
                  />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </Router>
          </ConfigProvider>
        </PricingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
