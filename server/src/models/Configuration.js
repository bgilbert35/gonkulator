const mongoose = require('mongoose');

// Schema for individual LaaS options (Sandbox, Developer Machines, etc.)
const LaaSOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Sandbox', 'Developer Machines', 'Pipeline Combined', 'Custom System']
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  vCPU: {
    type: Number,
    required: true
  },
  memory: {
    type: Number,
    required: true
  },
  storage: {
    type: Number,
    required: true
  }
});

// Schema for configuration versions (for history tracking)
const ConfigVersionSchema = new mongoose.Schema({
  laaSOptions: [LaaSOptionSchema],
  totalVCPU: Number,
  totalMemory: Number,
  totalStorage: Number,
  environmentSize: {
    type: String,
    enum: ['Small', 'Medium', 'Large']
  },
  costs: {
    wwt: {
      monthly: Number,
      annual: Number
    },
    dla: {
      monthly: Number,
      annual: Number
    },
    azure: {
      monthly: Number,
      annual: Number
    },
    aws: {
      monthly: Number,
      annual: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
});

// Main Configuration Schema
const ConfigurationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this configuration'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareableLink: {
    type: String,
    unique: true
  },
  currentVersion: {
    type: ConfigVersionSchema,
    required: true
  },
  versions: [ConfigVersionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate a unique shareable link before saving
ConfigurationSchema.pre('save', function(next) {
  if (!this.shareableLink) {
    this.shareableLink = generateUniqueId();
  }
  this.updatedAt = Date.now();
  next();
});

// Method to add a new version
ConfigurationSchema.methods.addVersion = function(versionData, userId) {
  // Create a new version
  const newVersion = {
    ...versionData,
    createdAt: Date.now(),
    createdBy: userId
  };
  
  // Add to versions array
  this.versions.push(newVersion);
  
  // Update current version
  this.currentVersion = newVersion;
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  return this.save();
};

// Method to revert to a previous version
ConfigurationSchema.methods.revertToVersion = function(versionIndex) {
  if (versionIndex < 0 || versionIndex >= this.versions.length) {
    throw new Error('Invalid version index');
  }
  
  // Set current version to the specified version
  this.currentVersion = this.versions[versionIndex];
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  return this.save();
};

// Helper function to generate a unique ID for shareable links
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

module.exports = mongoose.model('Configuration', ConfigurationSchema);
