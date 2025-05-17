import React from 'react';
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
  Paper
} from '@mui/material';
import {
  Calculate,
  Storage,
  Share
} from '@mui/icons-material';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 8,
          pb: 6,
          textAlign: 'center'
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          LaaS Budgetary Cost Calculator
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Create, save, and share cost calculations for your Lab as a Service (LaaS) configurations.
          Compare costs with cloud providers and make informed decisions for your lab infrastructure needs.
        </Typography>
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            gap: 2
          }}
        >
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/configuration/builder"
            startIcon={<Calculate />}
          >
            Start Building
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/login"
          >
            Login
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
              <Storage fontSize="large" color="primary" sx={{ mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Configure Resources
              </Typography>
              <Typography>
                Easily configure your LaaS resources including Sandbox, Developer Machines, 
                Pipeline Combined, and Custom Systems with specific vCPU, memory, and storage requirements.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
              <Calculate fontSize="large" color="primary" sx={{ mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Calculate Costs
              </Typography>
              <Typography>
                Get detailed cost breakdowns for your configurations, including monthly and annual costs.
                Compare with Azure and AWS to see potential savings.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
              <Share fontSize="large" color="primary" sx={{ mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Save & Share
              </Typography>
              <Typography>
                Save your configurations, track changes between versions, and share them with others
                using unique links. Perfect for team collaboration and budget planning.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Container>
  );
};

export default Home;
