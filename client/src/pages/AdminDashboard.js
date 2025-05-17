import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { ConfigContext } from '../context/ConfigContext';
import { AuthContext } from '../context/AuthContext';
import { TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, fetchUsers, users, loading: authLoading, error: authError, register } = useContext(AuthContext);
  const {
    configurations,
    loading: configLoading,
    error: configError,
    getUserConfigurations,
    deleteConfiguration
  } = useContext(ConfigContext);

  const [tabValue, setTabValue] = useState(0);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [registrationError, setRegistrationError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteConfiguration = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await deleteConfiguration(id);
      } catch (err) {
        console.error('Error deleting configuration:', err);
      }
    }
  };

  if (configLoading || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleCreateUser = async () => {
    try {
      // Validate input
      if (!newUserName || !newUserEmail || !newUserPassword) {
        setRegistrationError('Please fill in all fields');
        return;
      }

      // Call the register function from AuthContext
      const registrationData = await register({
        name: newUserName,
        username: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });

      if (registrationData.success) {
        // Clear the form
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('user');
        setRegistrationError(null);

        // Refresh the user list
        fetchUsers();
      } else {
        setRegistrationError(registrationData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(error.message || 'Registration failed');
    }
  };

  if (authLoading || configLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        {(authError || configError) && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {authError || configError}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Overview" />
            <Tab label="All Configurations" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h6">User Management</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Manage user accounts, roles, and permissions.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => setTabValue(2)}>
                    View Users
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SettingsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h6">Pricing Settings</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Configure pricing options, system capacities, and fees.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to="/admin/pricing"
                  >
                    Manage Pricing
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StorageIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h6">Configurations</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    View and manage all user configurations.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small"
                    onClick={() => setTabValue(1)}
                  >
                    View All
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total Configurations
                  </Typography>
                  <Typography variant="h4">{configurations.length}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Public Configurations
                  </Typography>
                  <Typography variant="h4">
                    {configurations.filter(config => config.isPublic).length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Private Configurations
                  </Typography>
                  <Typography variant="h4">
                    {configurations.filter(config => !config.isPublic).length}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>

            {/* Create User Form */}
            <Typography variant="h6" gutterBottom>
              Create New User
            </Typography>
            <FormControl fullWidth margin="normal">
              <TextField
                label="User Name"
                variant="outlined"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Email"
                variant="outlined"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={newUserRole}
                label="Role"
                onChange={(e) => setNewUserRole(e.target.value)}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleCreateUser}>
              Create User
            </Button>
            {registrationError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {registrationError}
              </Alert>
            )}

            {/* User List */}
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              All Users
            </Typography>
            {users && users.length > 0 ? (
              <List>
                {users.map((user) => (
                  <ListItem key={user._id}>
                    <ListItemText
                      primary={user.name}
                      secondary={`Email: ${user.email} | Role: ${user.role}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No users found.
              </Typography>
            )}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              All User Configurations
            </Typography>
            
            {configurations.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No configurations found.
              </Typography>
            ) : (
              <List>
                {configurations.map((config) => (
                  <React.Fragment key={config._id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">{config.name}</Typography>
                            {config.isPublic && (
                              <Chip
                                label="Public"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              Owner: {config.owner?.name || 'Unknown'} | 
                              Environment: {config.currentVersion.environmentSize} | 
                              Last updated: {new Date(config.updatedAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Resources: {config.currentVersion.totalVCPU} vCPU, {config.currentVersion.totalMemory} GB RAM, {config.currentVersion.totalStorage} GB Storage
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="view"
                          onClick={() => navigate(`/configuration/${config._id}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteConfiguration(config._id)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
