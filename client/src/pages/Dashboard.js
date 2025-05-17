import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { ConfigContext } from '../context/ConfigContext';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const {
    configurations,
    loading,
    error,
    getUserConfigurations,
    deleteConfiguration
  } = useContext(ConfigContext);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState(null);

  const handleShareClick = (config) => {
    setSelectedConfig(config);
    setShareDialogOpen(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/configuration/share/${selectedConfig.shareableLink}`;
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
  };

  const handleDeleteClick = (config) => {
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (configToDelete) {
      await deleteConfiguration(configToDelete._id);
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              {user.name}'s Configurations
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/configuration/builder"
            >
              New Configuration
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {configurations.length === 0 ? (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              You don't have any configurations yet.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/configuration/builder"
              sx={{ mt: 2 }}
            >
              Create Your First Configuration
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {configurations.map((config) => (
              <Grid item xs={12} sm={6} md={4} key={config._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {config.name}
                      </Typography>
                      {config.isPublic && (
                        <Chip
                          label="Public"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {config.description || 'No description provided'}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2">
                      <strong>Environment Size:</strong> {config.currentVersion.environmentSize}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total vCPU:</strong> {config.currentVersion.totalVCPU}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total Memory:</strong> {config.currentVersion.totalMemory} GB
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total Storage:</strong> {config.currentVersion.totalStorage} GB
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Versions:</strong> {config.versions.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Last updated: {new Date(config.updatedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/configuration/${config._id}`}
                      startIcon={<EditIcon />}
                    >
                      View
                    </Button>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleShareClick(config)}
                      aria-label="share"
                    >
                      <ShareIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(config)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
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
              value={selectedConfig ? `${window.location.origin}/configuration/share/${selectedConfig.shareableLink}` : ''}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the configuration "{configToDelete?.name}"? This action cannot be undone.
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

export default Dashboard;
