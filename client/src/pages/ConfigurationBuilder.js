import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Calculate as CalculateIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { PricingContext } from '../context/PricingContext';
import { ConfigContext } from '../context/ConfigContext';
import { AuthContext } from '../context/AuthContext';

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

const ConfigurationBuilder = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { pricing, loading: pricingLoading, getDefaultLaaSOptions, calculateCosts } = useContext(PricingContext);
  const { createConfiguration } = useContext(ConfigContext);
  const navigate = useNavigate();

  const [laaSOptions, setLaaSOptions] = useState([]);
  const [totals, setTotals] = useState({
    vCPU: 0,
    memory: 0,
    storage: 0
  });
  const [environmentSize, setEnvironmentSize] = useState('');
  const [costs, setCosts] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editingOption, setEditingOption] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editValues, setEditValues] = useState({
    quantity: 0,
    vCPU: 0,
    memory: 0,
    storage: 0
  });
  const [newOption, setNewOption] = useState({
    name: '',
    quantity: 1,
    vCPU: 0,
    memory: 0,
    storage: 0
  });

  // Colors for pie charts - improved color scheme with better contrast
  const COLORS = ['#3366CC', '#DC3912', '#FF9900'];


  useEffect(() => {
    // Initialize with default LaaS options
    const defaultOptions = getDefaultLaaSOptions();
    setLaaSOptions(defaultOptions);
    
    // Calculate initial totals
    calculateTotals(defaultOptions);
  }, [getDefaultLaaSOptions]);

  // Calculate totals whenever laaSOptions change
  const calculateTotals = (options) => {
    const newTotals = {
      vCPU: 0,
      memory: 0,
      storage: 0
    };

    options.forEach(option => {
      newTotals.vCPU += option.quantity * option.vCPU;
      newTotals.memory += option.quantity * option.memory;
      newTotals.storage += option.quantity * option.storage;
    });

    setTotals(newTotals);

    // Determine environment size if pricing data is available
    if (pricing && pricing.environmentSizeDefinitions) {
      const { environmentSizeDefinitions } = pricing;
      
      if (
        newTotals.vCPU > environmentSizeDefinitions.medium.vCPU.upperLimit ||
        newTotals.memory > environmentSizeDefinitions.medium.memory.upperLimit ||
        newTotals.storage > environmentSizeDefinitions.medium.storage.upperLimit
      ) {
        setEnvironmentSize('Large');
      } else if (
        newTotals.vCPU > environmentSizeDefinitions.small.vCPU.upperLimit ||
        newTotals.memory > environmentSizeDefinitions.small.memory.upperLimit ||
        newTotals.storage > environmentSizeDefinitions.small.storage.upperLimit
      ) {
        setEnvironmentSize('Medium');
      } else {
        setEnvironmentSize('Small');
      }
    }
  };

  const handleQuantityChange = (index, value) => {
    const newValue = parseInt(value, 10) || 0;
    const newOptions = [...laaSOptions];
    newOptions[index].quantity = newValue;
    setLaaSOptions(newOptions);
    calculateTotals(newOptions);
  };

  const handleEditClick = (option, index) => {
    setEditingOption({ ...option, index });
    setEditValues({
      quantity: option.quantity,
      vCPU: option.vCPU,
      memory: option.memory,
      storage: option.storage
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditValues({
      ...editValues,
      [field]: parseInt(value, 10) || 0
    });
  };

  const handleEditSave = () => {
    const newOptions = [...laaSOptions];
    newOptions[editingOption.index] = {
      ...newOptions[editingOption.index],
      quantity: editValues.quantity,
      vCPU: editValues.vCPU,
      memory: editValues.memory,
      storage: editValues.storage
    };
    setLaaSOptions(newOptions);
    calculateTotals(newOptions);
    setEditDialogOpen(false);
  };

  const handleAddClick = () => {
    setNewOption({
      name: '',
      quantity: 1,
      vCPU: 0,
      memory: 0,
      storage: 0
    });
    setAddDialogOpen(true);
  };

  const handleAddChange = (field, value) => {
    setNewOption({
      ...newOption,
      [field]: field === 'name' ? value : (parseInt(value, 10) || 0)
    });
  };

  const handleAddSave = () => {
    if (!newOption.name.trim()) {
      setError('Please provide a name for the new option');
      return;
    }

    const newOptions = [...laaSOptions, { ...newOption }];
    setLaaSOptions(newOptions);
    calculateTotals(newOptions);
    setAddDialogOpen(false);
    setError(null);
  };

  const handleDeleteOption = (index) => {
    const newOptions = [...laaSOptions];
    newOptions.splice(index, 1);
    setLaaSOptions(newOptions);
    calculateTotals(newOptions);
  };

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      setError(null);
      
      console.log('Calculating costs for options:', laaSOptions);
      const result = await calculateCosts(laaSOptions);
      console.log('Calculation result:', result);
      
      // Make sure result is not null or undefined
      if (!result) {
        throw new Error('No result returned from calculation');
      }
      
      setCosts(result);
      console.log('Costs state set:', result);
      
      // Switch to the Results tab
      setTabValue(1);
    } catch (err) {
      console.error('Error calculating costs:', err);
      setError('Failed to calculate costs. Please try again. Error: ' + (err.message || err));
    } finally {
      setCalculating(false);
    }
  };

  const handleSaveClick = () => {
    if (isAuthenticated) {
      setSaveDialogOpen(true);
    } else {
      navigate('/login');
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      if (!configName.trim()) {
        setError('Please provide a name for your configuration');
        return;
      }

      // Create configuration object
      const configData = {
        name: configName,
        description: configDescription,
        isPublic,
        currentVersion: {
          laaSOptions,
          totalVCPU: totals.vCPU,
          totalMemory: totals.memory,
          totalStorage: totals.storage,
          environmentSize,
          costs: costs.costs
        }
      };

      const savedConfig = await createConfiguration(configData);
      setSaveDialogOpen(false);
      
      // Navigate to the configuration details page
      navigate(`/configuration/${savedConfig._id}`);
    } catch (err) {
      setError('Failed to save configuration. Please try again.');
      console.error(err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Prepare data for pie charts
  const preparePieChartData = (costType) => {
    if (!costs) return [];

    const data = [
      { name: 'vCPU', value: costs.costs[costType].monthly * 0.4 }, // Approximation based on the Excel
      { name: 'Memory', value: costs.costs[costType].monthly * 0.35 },
      { name: 'Storage', value: costs.costs[costType].monthly * 0.25 }
    ];

    return data;
  };

  if (pricingLoading) {
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
          LaaS Cost Calculator
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="calculator tabs">
            <Tab label="Configuration" />
            <Tab label="Results" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                LaaS Options
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                size="small"
              >
                Add Option
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>LaaS Option</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">vCPU</TableCell>
                    <TableCell align="right">Memory (GB)</TableCell>
                    <TableCell align="right">Storage (GB)</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {laaSOptions.map((option, index) => (
                    <TableRow key={option.name}>
                      <TableCell component="th" scope="row">
                        {option.name}
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={option.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          inputProps={{ min: 0 }}
                          sx={{ width: '80px' }}
                        />
                      </TableCell>
                      <TableCell align="right">{option.vCPU}</TableCell>
                      <TableCell align="right">{option.memory}</TableCell>
                      <TableCell align="right">{option.storage}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title="Edit specifications">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(option, index)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {index > 0 && ( // Don't allow deleting the first few default options
                            <Tooltip title="Delete option">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteOption(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuration Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total vCPU
                  </Typography>
                  <Typography variant="h4">{totals.vCPU}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total Memory (GB)
                  </Typography>
                  <Typography variant="h4">{totals.memory}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total Storage (GB)
                  </Typography>
                  <Typography variant="h4">{totals.storage}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Environment Size: <strong>{environmentSize}</strong>
                <Tooltip title="Environment size is determined by your resource requirements">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CalculateIcon />}
                onClick={handleCalculate}
                disabled={calculating}
              >
                {calculating ? 'Calculating...' : 'Calculate Costs'}
              </Button>
            </Box>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {costs && (
            <>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Cost Summary
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Cost Type</TableCell>
                            <TableCell align="right">Monthly</TableCell>
                            <TableCell align="right">Annual</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* Show WWT Cost for all authenticated users, regardless of whether costs.costs.wwt exists */}
                          {isAuthenticated && (
                            <TableRow>
                              <TableCell component="th" scope="row">WWT Cost</TableCell>
                              <TableCell align="right">
                                ${costs.costs.wwt ? costs.costs.wwt.monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                              </TableCell>
                              <TableCell align="right">
                                ${costs.costs.wwt ? costs.costs.wwt.annual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell component="th" scope="row">DLA Cost</TableCell>
                            <TableCell align="right">${costs.costs.dla.monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                            <TableCell align="right">${costs.costs.dla.annual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                          {/* Show Total Cost for all authenticated users, with proper fallback for WWT costs */}
                          {isAuthenticated && (
                            <TableRow sx={{ fontWeight: 'bold', backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                              <TableCell component="th" scope="row"><strong>Total Cost</strong></TableCell>
                              <TableCell align="right">
                                <strong>
                                  ${((costs.costs.wwt ? costs.costs.wwt.monthly : 0) + costs.costs.dla.monthly).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>
                                  ${((costs.costs.wwt ? costs.costs.wwt.annual : 0) + costs.costs.dla.annual).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </strong>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="subtitle1" align="center" gutterBottom fontWeight="medium">
                        Cost Breakdown
                      </Typography>
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mt: -2 }}>
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={preparePieChartData('dla')}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={90}
                              innerRadius={30}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={2}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {preparePieChartData('dla').map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={1} />
                              ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} />
                            <RechartsTooltip 
                              formatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Cloud Comparison
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Provider</TableCell>
                        <TableCell align="right">Monthly Cost</TableCell>
                        <TableCell align="right">Annual Cost</TableCell>
                        <TableCell align="right">Savings vs LaaS</TableCell>
                        <TableCell align="right">Annual Savings</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">Azure Equivalent</TableCell>
                        <TableCell align="right">${costs.costs.azure.monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">${costs.costs.azure.annual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">{costs.costs.azure.savings}%</TableCell>
                        <TableCell align="right">${(costs.costs.azure.annual - costs.costs.dla.annual).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">AWS Equivalent</TableCell>
                        <TableCell align="right">${costs.costs.aws.monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">${costs.costs.aws.annual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">{costs.costs.aws.savings}%</TableCell>
                        <TableCell align="right">${(costs.costs.aws.annual - costs.costs.dla.annual).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setTabValue(0)}
                >
                  Back to Configuration
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveClick}
                >
                  Save Configuration
                </Button>
              </Box>
            </>
          )}
        </TabPanel>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit {editingOption?.name} Specifications</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                value={editValues.quantity}
                onChange={(e) => handleEditChange('quantity', e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="vCPU per unit"
                type="number"
                fullWidth
                value={editValues.vCPU}
                onChange={(e) => handleEditChange('vCPU', e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Memory (GB) per unit"
                type="number"
                fullWidth
                value={editValues.memory}
                onChange={(e) => handleEditChange('memory', e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Storage (GB) per unit"
                type="number"
                fullWidth
                value={editValues.storage}
                onChange={(e) => handleEditChange('storage', e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Option Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New LaaS Option</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Option Name"
                type="text"
                fullWidth
                value={newOption.name}
                onChange={(e) => handleAddChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                value={newOption.quantity}
                onChange={(e) => handleAddChange('quantity', e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="vCPU per unit"
                type="number"
                fullWidth
                value={newOption.vCPU}
                onChange={(e) => handleAddChange('vCPU', e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Memory (GB) per unit"
                type="number"
                fullWidth
                value={newOption.memory}
                onChange={(e) => handleAddChange('memory', e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Storage (GB) per unit"
                type="number"
                fullWidth
                value={newOption.storage}
                onChange={(e) => handleAddChange('storage', e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSave} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Configuration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a name and optional description for your configuration.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Configuration Name"
            type="text"
            fullWidth
            variant="outlined"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            required
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={configDescription}
            onChange={(e) => setConfigDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                color="primary"
              />
            }
            label="Make this configuration public"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfiguration} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
 );
};

export default ConfigurationBuilder;
