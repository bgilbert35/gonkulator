const Configuration = require('../models/Configuration');
const User = require('../models/User');

// @desc    Get all configurations
// @route   GET /api/configurations
// @access  Private
exports.getConfigurations = async (req, res) => {
  try {
    let query;
    
    // If user is admin, they can see all configurations
    if (req.user.role === 'admin') {
      query = Configuration.find().populate({
        path: 'owner',
        select: 'name email'
      });
    } else {
      // Regular users can only see their own configurations
      query = Configuration.find({ owner: req.user.id });
    }
    
    const configurations = await query;
    
    res.status(200).json({
      success: true,
      count: configurations.length,
      data: configurations
    });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get public configurations
// @route   GET /api/configurations/public
// @access  Public
exports.getPublicConfigurations = async (req, res) => {
  try {
    const configurations = await Configuration.find({ isPublic: true })
      .populate({
        path: 'owner',
        select: 'name'
      });
    
    res.status(200).json({
      success: true,
      count: configurations.length,
      data: configurations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single configuration
// @route   GET /api/configurations/:id
// @access  Private
exports.getConfiguration = async (req, res) => {
  try {
    const configuration = await Configuration.findById(req.params.id)
      .populate({
        path: 'owner',
        select: 'name email'
      });
    
    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found'
      });
    }
    
    // Make sure user is configuration owner or admin
    if (
      configuration.owner._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      !configuration.isPublic
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this configuration'
      });
    }
    
    res.status(200).json({
      success: true,
      data: configuration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get configuration by shareable link
// @route   GET /api/configurations/share/:link
// @access  Public
exports.getConfigurationByLink = async (req, res) => {
  try {
    const configuration = await Configuration.findOne({
      shareableLink: req.params.link
    }).populate({
      path: 'owner',
      select: 'name'
    });
    
    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: configuration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new configuration
// @route   POST /api/configurations
// @access  Private
exports.createConfiguration = async (req, res) => {
  try {
    // Add owner to req.body
    req.body.owner = req.user.id;
    
    // Create configuration
    const configuration = await Configuration.create({
      name: req.body.name,
      description: req.body.description,
      owner: req.body.owner,
      isPublic: req.body.isPublic || false,
      currentVersion: req.body.currentVersion,
      versions: [req.body.currentVersion]
    });
    
    res.status(201).json({
      success: true,
      data: configuration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update configuration
// @route   PUT /api/configurations/:id
// @access  Private
exports.updateConfiguration = async (req, res) => {
  try {
    let configuration = await Configuration.findById(req.params.id);
    
    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found'
      });
    }
    
    // Make sure user is configuration owner or admin
    if (
      configuration.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this configuration'
      });
    }
    
    // Update basic fields
    if (req.body.name) configuration.name = req.body.name;
    if (req.body.description) configuration.description = req.body.description;
    if (req.body.isPublic !== undefined) configuration.isPublic = req.body.isPublic;
    
    // If there's a new version, add it
    if (req.body.newVersion) {
      await configuration.addVersion(req.body.newVersion, req.user.id);
    } else {
      // Just update the timestamp
      configuration.updatedAt = Date.now();
      await configuration.save();
    }
    
    res.status(200).json({
      success: true,
      data: configuration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Revert to a previous version
// @route   PUT /api/configurations/:id/revert/:versionIndex
// @access  Private
exports.revertVersion = async (req, res) => {
  try {
    const { id, versionIndex } = req.params;
    
    let configuration = await Configuration.findById(id);
    
    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found'
      });
    }
    
    // Make sure user is configuration owner or admin
    if (
      configuration.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this configuration'
      });
    }
    
    // Revert to the specified version
    await configuration.revertToVersion(versionIndex);
    
    res.status(200).json({
      success: true,
      data: configuration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete configuration
// @route   DELETE /api/configurations/:id
// @access  Private
exports.deleteConfiguration = async (req, res) => {
  try {
    const configuration = await Configuration.findById(req.params.id);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found'
      });
    }

    // Make sure user is configuration owner or admin
    if (
      configuration.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this configuration'
      });
    }

    // Use findByIdAndDelete instead of deleteOne
    await Configuration.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
