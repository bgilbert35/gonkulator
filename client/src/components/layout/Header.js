import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  Settings,
  ExitToApp,
  Add
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/');
  };

  const isAdmin = user && user.role === 'admin';

  const authLinks = (
    <>
      <Button 
        color="inherit" 
        component={RouterLink} 
        to="/configuration/builder"
        startIcon={<Add />}
        sx={{ display: { xs: 'none', md: 'flex' } }}
      >
        New Configuration
      </Button>
      <Button 
        color="inherit" 
        component={RouterLink} 
        to="/dashboard"
        startIcon={<Dashboard />}
        sx={{ display: { xs: 'none', md: 'flex' } }}
      >
        Dashboard
      </Button>
      {isAdmin && (
        <Button 
          color="inherit" 
          component={RouterLink} 
          to="/admin"
          startIcon={<Settings />}
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          Admin
        </Button>
      )}
      <IconButton
        edge="end"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
          <Dashboard fontSize="small" style={{ marginRight: 8 }} />
          Dashboard
        </MenuItem>
        {isAdmin && (
          <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
            <Settings fontSize="small" style={{ marginRight: 8 }} />
            Admin Settings
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>
          <ExitToApp fontSize="small" style={{ marginRight: 8 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );

  const guestLinks = (
    <>
      <Button 
        color="inherit" 
        component={RouterLink} 
        to="/login"
        sx={{ display: { xs: 'none', md: 'flex' } }}
      >
        Login
      </Button>
      <Button 
        color="inherit" 
        component={RouterLink} 
        to="/register"
        sx={{ display: { xs: 'none', md: 'flex' } }}
      >
        Register
      </Button>
    </>
  );

  const mobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={() => setMobileMenuAnchorEl(null)}
    >
      {isAuthenticated ? (
        <>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/configuration/builder'); }}>
            <Add fontSize="small" style={{ marginRight: 8 }} />
            New Configuration
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
            <Dashboard fontSize="small" style={{ marginRight: 8 }} />
            Dashboard
          </MenuItem>
          {isAdmin && (
            <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
              <Settings fontSize="small" style={{ marginRight: 8 }} />
              Admin Settings
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>
            <ExitToApp fontSize="small" style={{ marginRight: 8 }} />
            Logout
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/login'); }}>
            Login
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/register'); }}>
            Register
          </MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    <AppBar position="static">
      <Container>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            LaaS Cost Calculator
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile ? (
              <>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMobileMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
                {mobileMenu}
              </>
            ) : (
              isAuthenticated ? authLinks : guestLinks
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
