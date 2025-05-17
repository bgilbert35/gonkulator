import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { PricingContext } from '../context/PricingContext';

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

const PricingSettings = () => {
  const navigate = useNavigate();
  const { pricing, loading, error, getPricing, updatePricing } = useContext(PricingContext);

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load pricing data on component mount
  useEffect(() => {
    const loadPricing = async () => {
      await getPricing();
    };

    // Only load pricing if we don't already have it
    if (!pricing) {
      loadPricing();
    }
  }, [getPricing, pricing]);

  useEffect(() => {
    if (pricing) {
      setFormData({ ...pricing });
    }
  }, [pricing]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (section, subsection, field, value) => {
    const numValue = parseFloat(value);
    
    setFormData(prevData => {
      const newData = { ...prevData };
      
      if (subsection) {
        newData[section][subsection][field] = isNaN(numValue) ? 0 : numValue;
      } else {
        newData[section][field] = isNaN(numValue) ? 0 : numValue;
      }
      
      return newData;
    });
  };

  const handleNestedInputChange = (section, subsection, nestedSection, field, value) => {
    const numValue = parseFloat(value);
    
    setFormData(prevData => {
      const newData = { ...prevData };
      newData[section][subsection][nestedSection][field] = isNaN(numValue) ? 0 : numValue;
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      await updatePricing(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving pricing settings:', err);
    }
  };

  if (loading || !formData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin')}
              sx={{ mb: 2 }}
            >
              Back to Admin Dashboard
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              Pricing Settings
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {saveSuccess && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Pricing settings saved successfully!
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="pricing tabs">
            <Tab label="System Capacity" />
            <Tab label="Monthly Costs" />
            <Tab label="Environment Sizes" />
            <Tab label="Fees & Cloud Costs" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Capacity Definitions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Define the total vCPU, memory, and storage for each system capacity level.
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>System Size</TableCell>
                    <TableCell align="right">Total vCPU</TableCell>
                    <TableCell align="right">Total Memory (GB)</TableCell>
                    <TableCell align="right">Total Storage (GB)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {['small', 'medium', 'large'].map((size) => (
                    <TableRow key={size}>
                      <TableCell component="th" scope="row">
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={formData.systemCapacity[size].vCPU}
                          onChange={(e) => handleInputChange('systemCapacity', size, 'vCPU', e.target.value)}
                          inputProps={{ min: 0 }}
                          sx={{ width: '100px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={formData.systemCapacity[size].memory}
                          onChange={(e) => handleInputChange('systemCapacity', size, 'memory', e.target.value)}
                          inputProps={{ min: 0 }}
                          sx={{ width: '100px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={formData.systemCapacity[size].storage}
                          onChange={(e) => handleInputChange('systemCapacity', size, 'storage', e.target.value)}
                          inputProps={{ min: 0 }}
                          sx={{ width: '100px' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Cost Per Metric
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Define the monthly cost per vCPU, memory (GB), and storage (GB) for each environment size.
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Environment Size</TableCell>
                    <TableCell align="right">vCPU ($)</TableCell>
                    <TableCell align="right">Memory ($/GB)</TableCell>
                    <TableCell align="right">Storage ($/GB)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {['small', 'medium', 'large'].map((size) => (
                    <TableRow key={size}>
                      <TableCell component="th" scope="row">
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={formData.monthlyCost[size].vCPU}
                          onChange={(e) => handleInputChange('monthlyCost', size, 'vCPU', e.target.value)}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: '100px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={formData.monthlyCost[size].memory}
                          onChange={(e) => handleInputChange('monthlyCost', size, 'memory', e.target.value)}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: '100px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={formData.monthlyCost[size].storage}
                          onChange={(e) => handleInputChange('monthlyCost', size, 'storage', e.target.value)}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: '100px' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Environment Size Definitions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Define the resource limits for each environment size.
            </Typography>

            <Grid container spacing={4}>
              {['small', 'medium', 'large'].map((size) => (
                <Grid item xs={12} md={4} key={size}>
                  <Typography variant="subtitle1" gutterBottom>
                    {size.charAt(0).toUpperCase() + size.slice(1)} Environment
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Resource</TableCell>
                          <TableCell align="right">Lower Limit</TableCell>
                          <TableCell align="right">Upper Limit</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {['vCPU', 'memory', 'storage'].map((resource) => (
                          <TableRow key={`${size}-${resource}`}>
                            <TableCell>{resource === 'vCPU' ? 'vCPU' : `${resource.charAt(0).toUpperCase() + resource.slice(1)} (GB)`}</TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                value={formData.environmentSizeDefinitions[size][resource].lowerLimit}
                                onChange={(e) => handleNestedInputChange('environmentSizeDefinitions', size, resource, 'lowerLimit', e.target.value)}
                                inputProps={{ min: 0 }}
                                sx={{ width: '80px' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                value={formData.environmentSizeDefinitions[size][resource].upperLimit}
                                onChange={(e) => handleNestedInputChange('environmentSizeDefinitions', size, resource, 'upperLimit', e.target.value)}
                                inputProps={{ min: 0 }}
                                sx={{ width: '80px' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Fees
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Define the fees applied to the base costs.
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography sx={{ width: '200px' }}>WWT Lab Manager Fee:</Typography>
                      <TextField
                        type="number"
                        size="small"
                        value={formData.fees.wwtLabManagerFee}
                        onChange={(e) => handleInputChange('fees', null, 'wwtLabManagerFee', e.target.value)}
                        inputProps={{ min: 0, max: 1, step: 0.01 }}
                        sx={{ width: '100px' }}
                      />
                      <Typography sx={{ ml: 1 }}>
                        ({(formData.fees.wwtLabManagerFee * 100).toFixed(0)}%)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ width: '200px' }}>DLA Fee:</Typography>
                      <TextField
                        type="number"
                        size="small"
                        value={formData.fees.dlaFee}
                        onChange={(e) => handleInputChange('fees', null, 'dlaFee', e.target.value)}
                        inputProps={{ min: 0, max: 1, step: 0.01 }}
                        sx={{ width: '100px' }}
                      />
                      <Typography sx={{ ml: 1 }}>
                        ({(formData.fees.dlaFee * 100).toFixed(0)}%)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Cloud Provider Costs
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Define the costs for cloud providers (for comparison).
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Azure</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>vCPU ($)</Typography>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={formData.cloudCosts.azure.vCPU}
                        onChange={(e) => handleInputChange('cloudCosts', 'azure', 'vCPU', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>Memory ($/GB)</Typography>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={formData.cloudCosts.azure.memory}
                        onChange={(e) => handleInputChange('cloudCosts', 'azure', 'memory', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" gutterBottom>Storage ($/GB)</Typography>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={formData.cloudCosts.azure.storage}
                        onChange={(e) => handleInputChange('cloudCosts', 'azure', 'storage', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>AWS</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>vCPU ($)</Typography>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={formData.cloudCosts.aws.vCPU}
                        onChange={(e) => handleInputChange('cloudCosts', 'aws', 'vCPU', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>Memory ($/GB)</Typography>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={formData.cloudCosts.aws.memory}
                        onChange={(e) => handleInputChange('cloudCosts', 'aws', 'memory', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" gutterBottom>Storage ($/GB)</Typography>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={formData.cloudCosts.aws.storage}
                        onChange={(e) => handleInputChange('cloudCosts', 'aws', 'storage', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default PricingSettings;
