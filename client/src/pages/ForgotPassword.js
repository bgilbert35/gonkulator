import React, { useState, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Box,
  Avatar,
  Paper,
  Alert
} from '@mui/material';
import { LockResetOutlined } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('info');
  const [alertMessage, setAlertMessage] = useState('');

  const { forgotPassword, loading } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setAlertType('error');
      setAlertMessage('Please enter your email address');
      setShowAlert(true);
      return;
    }

    try {
      const res = await forgotPassword(email);
      setEmailSent(true);
      setAlertType('success');
      setAlertMessage('Password reset instructions sent to your email');
      setShowAlert(true);
      
      // In a real application, you would not display the token
      // This is just for demonstration purposes since we're not sending real emails
      console.log('Reset token (for demo purposes):', res.data.resetToken);
    } catch (err) {
      setAlertType('error');
      setAlertMessage(err.response?.data?.error || 'Failed to process request');
      setShowAlert(true);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockResetOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>

        {showAlert && (
          <Alert severity={alertType} sx={{ width: '100%', mt: 2 }}>
            {alertMessage}
          </Alert>
        )}

        {!emailSent ? (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to Login
                </Link>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              If an account exists with that email, we've sent instructions to reset your password.
            </Typography>
            <Button
              component={RouterLink}
              to="/login"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Return to Login
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
