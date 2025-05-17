const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // Require bcrypt for password hashing

// Load environment variables
dotenv.config();

// Import the Pricing model
const Pricing = require('./src/models/Pricing');
const User = require('./src/models/User'); // Import the User model

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Initialize admin user
const initAdminUser = async () => {
  try {
    // Check if an admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create a default admin user
    const adminData = {
      name: process.env.ADMIN_NAME || 'Admin User',
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'password',
      role: 'admin'
    };

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    const admin = await User.create(adminData);
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

// Initialize pricing data
const initPricing = async () => {
  try {
    // Check if pricing data already exists
    const existingPricing = await Pricing.findOne();

    if (existingPricing) {
      console.log('Pricing data already exists');
      return;
    }
    
    // Create default pricing data
    const pricingData = {
      systemCapacity: {
        small: {
          vCPU: 16,
          memory: 96,
          storage: 8096
        },
        medium: {
          vCPU: 96,
          memory: 960,
          storage: 8096
        },
        large: {
          vCPU: 186,
          memory: 2064,
          storage: 22528
        }
      },
      monthlyCost: {
        small: {
          vCPU: 8.50,
          memory: 2.50,
          storage: 0.06
        },
        medium: {
          vCPU: 7.50,
          memory: 1.60,
          storage: 0.05
        },
        large: {
          vCPU: 6.75,
          memory: 1.50,
          storage: 0.04
        }
      },
      environmentSizeDefinitions: {
        small: {
          vCPU: { 
            lowerLimit: 0,
            upperLimit: 100
          },
          memory: {
            lowerLimit: 0,
            upperLimit: 500
          },
          storage: {
            lowerLimit: 0,
            upperLimit: 2000
          }
        },
        medium: {
          vCPU: {
            lowerLimit: 101,
            upperLimit: 300
          },
          memory: {
            lowerLimit: 501,
            upperLimit: 4000
          },
          storage: {
            lowerLimit: 4000,
            upperLimit: 9999
          }
        },
        large: {
          vCPU: {
            lowerLimit: 301,
            upperLimit: 999999
          },
          memory: {
            lowerLimit: 4001,
            upperLimit: 999999
          },
          storage: {
            lowerLimit: 10000,
            upperLimit: 999999
          }
        }
      },
      fees: {
        wwtLabManagerFee: 0.25, // 25%
        dlaFee: 0.11 // 11%
      },
      cloudCosts: {
        azure: {
          vCPU: 12.60,
          memory: 8.96,
          storage: 0.048
        },
        aws: {
          vCPU: 7.46,
          memory: 8.00,
          storage: 0.10
        }
      },
      updatedAt: Date.now()
    };
    
    const pricing = await Pricing.create(pricingData);
    console.log('Pricing data initialized successfully');
    
  } catch (error) {
    console.error('Error initializing pricing data:', error);
  }
};

const closeMongoDBConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

// Run the initializations
const initializeData = async () => {
  try {
    await initAdminUser();
    await initPricing();
  } catch (error) {
    console.error('Error during initialization:', error);
  } finally {
    await closeMongoDBConnection();
  }
};

initializeData();
