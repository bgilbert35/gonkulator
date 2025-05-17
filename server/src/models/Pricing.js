const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema({
  // System capacity definitions
  systemCapacity: {
    small: {
      vCPU: { type: Number, default: 16 },
      memory: { type: Number, default: 96 },
      storage: { type: Number, default: 8096 }
    },
    medium: {
      vCPU: { type: Number, default: 96 },
      memory: { type: Number, default: 960 },
      storage: { type: Number, default: 8096 }
    },
    large: {
      vCPU: { type: Number, default: 186 },
      memory: { type: Number, default: 2064 },
      storage: { type: Number, default: 22528 }
    }
  },
  
  // Monthly cost per metric
  monthlyCost: {
    small: {
      vCPU: { type: Number, default: 8.50 },
      memory: { type: Number, default: 2.50 },
      storage: { type: Number, default: 0.06 }
    },
    medium: {
      vCPU: { type: Number, default: 7.50 },
      memory: { type: Number, default: 1.60 },
      storage: { type: Number, default: 0.05 }
    },
    large: {
      vCPU: { type: Number, default: 6.75 },
      memory: { type: Number, default: 1.50 },
      storage: { type: Number, default: 0.04 }
    }
  },
  
  // Environment size definitions
  environmentSizeDefinitions: {
    small: {
      vCPU: { 
        lowerLimit: { type: Number, default: 0 },
        upperLimit: { type: Number, default: 100 }
      },
      memory: {
        lowerLimit: { type: Number, default: 0 },
        upperLimit: { type: Number, default: 500 }
      },
      storage: {
        lowerLimit: { type: Number, default: 0 },
        upperLimit: { type: Number, default: 2000 }
      }
    },
    medium: {
      vCPU: {
        lowerLimit: { type: Number, default: 101 },
        upperLimit: { type: Number, default: 300 }
      },
      memory: {
        lowerLimit: { type: Number, default: 501 },
        upperLimit: { type: Number, default: 4000 }
      },
      storage: {
        lowerLimit: { type: Number, default: 4000 },
        upperLimit: { type: Number, default: 9999 }
      }
    },
    large: {
      vCPU: {
        lowerLimit: { type: Number, default: 301 },
        upperLimit: { type: Number, default: 999999 }
      },
      memory: {
        lowerLimit: { type: Number, default: 4001 },
        upperLimit: { type: Number, default: 999999 }
      },
      storage: {
        lowerLimit: { type: Number, default: 10000 },
        upperLimit: { type: Number, default: 999999 }
      }
    }
  },
  
  // Fees
  fees: {
    wwtLabManagerFee: { type: Number, default: 0.25 }, // 25%
    dlaFee: { type: Number, default: 0.11 } // 11%
  },
  
  // Cloud provider costs
  cloudCosts: {
    azure: {
      vCPU: { type: Number, default: 9.50 },
      memory: { type: Number, default: 9.40 },
      storage: { type: Number, default: 0.03 }
    },
    aws: {
      vCPU: { type: Number, default: 8.70 },
      memory: { type: Number, default: 8.70 },
      storage: { type: Number, default: 0.10 }
    }
  },
  
  // Last updated timestamp
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Who updated it
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Create a singleton model - only one pricing document should exist
PricingSchema.statics.getLatest = async function() {
  const pricing = await this.findOne().sort({ updatedAt: -1 });
  
  if (!pricing) {
    // Create default pricing if none exists
    return await this.create({});
  }
  
  return pricing;
};

module.exports = mongoose.model('Pricing', PricingSchema);
