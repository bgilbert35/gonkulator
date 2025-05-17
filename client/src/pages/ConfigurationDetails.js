import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import {
  Edit as EditIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
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

const ConfigurationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    currentConfig,
    loading,
    error,
    getConfigurationById,
    deleteConfiguration,
    revertToVersion
  } = useContext(ConfigContext);

  const [tabValue, setTabValue] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        await getConfigurationById(id);
      } catch (err) {
        console.error('Error loading configuration:', err);
      }
    };

    loadConfiguration();
  }, [getConfigurationById, id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleShareClick = () => {
    setShareDialogOpen(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/configuration/share/${currentConfig.shareableLink}`;
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
  };

  const handleHistoryClick = () => {
    setHistoryDialogOpen(true);
  };

  const handleRevertVersion = async (versionIndex) => {
    try {
      await revertToVersion(id, versionIndex);
      setHistoryDialogOpen(false);
    } catch (err) {
      console.error('Error reverting version:', err);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteConfiguration(id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting configuration:', err);
    }
  };

  // Prepare data for pie charts
  const preparePieChartData = (costType) => {
    if (!currentConfig || !currentConfig.currentVersion.costs[costType]) return [];

    const data = [
      { name: 'vCPU', value: currentConfig.currentVersion.costs[costType].monthly * 0.4 }, // Approximation
      { name: 'Memory', value: currentConfig.currentVersion.costs[costType].monthly * 0.35 },
      { name: 'Storage', value: currentConfig.currentVersion.costs[costType].monthly * 0.25 }
    ];

    return data;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => user ? navigate('/dashboard') : navigate('/configuration/builder')}
            sx={{ mt: 2 }}
          >
            {user ? 'Back to Dashboard' : 'Back to Calculator'}
          </Button>
        </Box>
      </Container>
    );
  }

  if (!currentConfig) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="info">Loading configuration...</Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/configuration/builder')}
            sx={{ mt: 2 }}
          >
            Back to Calculator
          </Button>
        </Box>
      </Container>
    );
  }

  const { currentVersion } = currentConfig;
  const isOwner = user && currentConfig.owner && user.id === currentConfig.owner._id;
  const isAdmin = user && user.role === 'admin';

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => user ? navigate('/dashboard') : navigate('/configuration/builder')}
              sx={{ mb: 2 }}
            >
              {user ? 'Back to Dashboard' : 'Back to Calculator'}
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentConfig.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {currentConfig.description || 'No description provided'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="body2">
                Created by: {currentConfig.owner?.name || 'Unknown'}
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2">
                Last updated: {new Date(currentConfig.updatedAt).toLocaleDateString()}
              </Typography>
              {currentConfig.isPublic && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Chip size="small" label="Public" color="primary" variant="outlined" />
                </>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Share Configuration">
              <IconButton onClick={handleShareClick} color="primary">
                <ShareIcon />
              </IconButton>
            </Tooltip>
            {(isOwner || isAdmin) && (
              <>
                <Tooltip title="Version History">
                  <IconButton onClick={handleHistoryClick} color="primary">
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Configuration">
                  <IconButton onClick={handleDeleteClick} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="configuration tabs">
            <Tab label="Configuration" />
            <Tab label="Cost Analysis" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              LaaS Options
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>LaaS Option</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">vCPU</TableCell>
                    <TableCell align="right">Memory (GB)</TableCell>
                    <TableCell align="right">Storage (GB)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentVersion.laaSOptions.map((option) => (
                    <TableRow key={option.name}>
                      <TableCell component="th" scope="row">
                        {option.name}
                      </TableCell>
                      <TableCell align="right">{option.quantity}</TableCell>
                      <TableCell align="right">{option.vCPU}</TableCell>
                      <TableCell align="right">{option.memory}</TableCell>
                      <TableCell align="right">{option.storage}</TableCell>
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
                  <Typography variant="h4">{currentVersion.totalVCPU}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total Memory (GB)
                  </Typography>
                  <Typography variant="h4">{currentVersion.totalMemory}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total Storage (GB)
                  </Typography>
                  <Typography variant="h4">{currentVersion.totalStorage}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Environment Size: <strong>{currentVersion.environmentSize}</strong>
              </Typography>
            </Box>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
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
                      {(isAdmin || isOwner) && currentVersion.costs.wwt && (
                        <TableRow>
                          <TableCell component="th" scope="row">WWT Cost</TableCell>
                          <TableCell align="right">${currentVersion.costs.wwt.monthly.toFixed(2)}</TableCell>
                          <TableCell align="right">${currentVersion.costs.wwt.annual.toFixed(2)}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row">DLA Cost</TableCell>
                        <TableCell align="right">${currentVersion.costs.dla.monthly.toFixed(2)}</TableCell>
                        <TableCell align="right">${currentVersion.costs.dla.annual.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">Azure Equivalent</TableCell>
                        <TableCell align="right">${currentVersion.costs.azure.monthly.toFixed(2)}</TableCell>
                        <TableCell align="right">${currentVersion.costs.azure.annual.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">AWS Equivalent</TableCell>
                        <TableCell align="right">${currentVersion.costs.aws.monthly.toFixed(2)}</TableCell>
                        <TableCell align="right">${currentVersion.costs.aws.annual.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <Typography variant="subtitle1" align="center" gutterBottom>
                    DLA Monthly Cost Breakdown
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePieChartData('dla')}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {preparePieChartData('dla').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cloud Comparison
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Azure Savings
                  </Typography>
                  <Typography variant="h4">
                    {currentVersion.costs.azure.savings}% savings with LaaS
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Annual savings: ${(currentVersion.costs.azure.annual - currentVersion.costs.dla.annual).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    AWS Savings
                  </Typography>
                  <Typography variant="h4">
                    {currentVersion.costs.aws.savings}% savings with LaaS
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Annual savings: ${(currentVersion.costs.aws.annual - currentVersion.costs.dla.annual).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      </Box>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Configuration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Share this link with others to let them view your configuration:
          </DialogContentText>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={`${window.location.origin}/configuration/share/${currentConfig.shareableLink}`}
              InputProps={{
                readOnly: true,
              }}
            />
            <IconButton color="primary" onClick={handleCopyLink} sx={{ ml: 1 }}>
              <CopyIcon />
            </IconButton>
          </Box>
          {copied && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Link copied to clipboard!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Version</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Environment Size</TableCell>
                  <TableCell>Total Resources</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentConfig.versions.map((version, index) => (
                  <TableRow key={index} selected={index === currentConfig.versions.length - 1}>
                    <TableCell>Version {index + 1}</TableCell>
                    <TableCell>{new Date(version.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{version.environmentSize}</TableCell>
                    <TableCell>
                      {version.totalVCPU} vCPU, {version.totalMemory} GB RAM, {version.totalStorage} GB Storage
                    </TableCell>
                    <TableCell>
                      {index !== currentConfig.versions.length - 1 && (
                        <Button
                          size="small"
                          onClick={() => handleRevertVersion(index)}
                        >
                          Revert to this version
                        </Button>
                      )}
                      {index === currentConfig.versions.length - 1 && (
                        <Chip size="small" label="Current" color="primary" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this configuration? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConfigurationDetails;
