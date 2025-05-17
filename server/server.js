const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  next();
});

// Import routes
const authRoutes = require('./src/routes/auth');
const configRoutes = require('./src/routes/configurations');
const pricingRoutes = require('./src/routes/pricing');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/configurations', configRoutes);
app.use('/api/pricing', pricingRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Import User model
const User = require('./src/models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/laas-calculator');
    console.log('MongoDB connected successfully');
    
    // Test the connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Initialize default admin user
    await initAdminUser();
  } catch (error) {
    console.error('MongoDB connection error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Initialize default admin user
const initAdminUser = async () => {
  try {
    // Check if admin user already exists by email
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (adminExists) {
      // Update existing admin user with username if it doesn't have one
      if (!adminExists.username) {
        adminExists.username = 'admin';
        await adminExists.save();
        console.log('Existing admin user updated with username');
      }
    } else {
      // Create new admin user
      await User.create({
        name: 'Admin',
        username: 'admin',
        email: 'admin@example.com',
        password: 'WWTwwt1!',
        role: 'admin'
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error managing admin user:', error.message);
  }
};

// Connect to database
connectDB();

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
