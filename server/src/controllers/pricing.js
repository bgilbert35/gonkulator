const Pricing = require('../models/Pricing');

// @desc    Get current pricing
// @route   GET /api/pricing
// @access  Public
exports.getPricing = async (req, res) => {
  try {
    console.log('Get pricing request received');
    console.log('User authenticated:', req.user ? `Yes - ${req.user.name} (${req.user.role})` : 'No');
    
    const pricing = await Pricing.getLatest();
    console.log('Pricing data retrieved:', pricing ? 'Yes' : 'No');
    
    // For admin users or when accessing the pricing settings page, return full pricing data
    if (req.user && req.user.role === 'admin') {
      console.log('Returning full pricing data for admin user');
      return res.status(200).json({
        success: true,
        data: pricing
      });
    }
    
    // For non-admin users, filter out sensitive pricing information
    // Create a filtered version of pricing that excludes WWT costs
    const filteredPricing = {
      systemCapacity: pricing.systemCapacity,
      monthlyCost: pricing.monthlyCost, // Include this for calculation purposes
      environmentSizeDefinitions: pricing.environmentSizeDefinitions,
      fees: {
        dlaFee: pricing.fees.dlaFee
      },
      cloudCosts: pricing.cloudCosts, // Include this for comparison purposes
      updatedAt: pricing.updatedAt
    };
    
    res.status(200).json({
      success: true,
      data: filteredPricing
    });
  } catch (error) {
    console.error('Calculate costs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update pricing
// @route   PUT /api/pricing
// @access  Private (Admin only)
exports.updatePricing = async (req, res) => {
  try {
    const pricing = await Pricing.getLatest();
    
    // Update pricing fields
    const {
      systemCapacity,
      monthlyCost,
      environmentSizeDefinitions,
      fees,
      cloudCosts
    } = req.body;
    
    if (systemCapacity) pricing.systemCapacity = systemCapacity;
    if (monthlyCost) pricing.monthlyCost = monthlyCost;
    if (environmentSizeDefinitions) pricing.environmentSizeDefinitions = environmentSizeDefinitions;
    if (fees) pricing.fees = fees;
    if (cloudCosts) pricing.cloudCosts = cloudCosts;
    
    // Update metadata
    pricing.updatedAt = Date.now();
    pricing.updatedBy = req.user.id;
    
    await pricing.save();
    
    res.status(200).json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Calculate costs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Calculate costs based on configuration
// @route   POST /api/pricing/calculate
// @access  Public with optional authentication
exports.calculateCosts = async (req, res) => {
  try {
    console.log('Calculate costs request received:', req.body);
    console.log('User authenticated:', req.user ? `Yes - ${req.user.name} (${req.user.role})` : 'No');
    
    const { laaSOptions } = req.body;
    
    if (!laaSOptions || !Array.isArray(laaSOptions)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid LaaS options'
      });
    }
    
    // Get latest pricing
    const pricing = await Pricing.getLatest();
    console.log('Pricing data retrieved:', pricing ? 'Yes' : 'No');
    
    // Calculate totals
    let totalVCPU = 0;
    let totalMemory = 0;
    let totalStorage = 0;
    
    laaSOptions.forEach(option => {
      totalVCPU += option.quantity * option.vCPU;
      totalMemory += option.quantity * option.memory;
      totalStorage += option.quantity * option.storage;
    });
    
    console.log('Calculated totals:', { totalVCPU, totalMemory, totalStorage });
    
    // Determine environment size
    let environmentSize = 'Small';
    
    if (
      totalVCPU > pricing.environmentSizeDefinitions.small.vCPU.upperLimit ||
      totalMemory > pricing.environmentSizeDefinitions.small.memory.upperLimit ||
      totalStorage > pricing.environmentSizeDefinitions.small.storage.upperLimit
    ) {
      environmentSize = 'Medium';
    }
    
    if (
      totalVCPU > pricing.environmentSizeDefinitions.medium.vCPU.upperLimit ||
      totalMemory > pricing.environmentSizeDefinitions.medium.memory.upperLimit ||
      totalStorage > pricing.environmentSizeDefinitions.medium.storage.upperLimit
    ) {
      environmentSize = 'Large';
    }
    
    console.log('Determined environment size:', environmentSize);
    
    // Get cost rates based on environment size
    const costRates = pricing.monthlyCost[environmentSize.toLowerCase()];
    
    // Calculate monthly costs
    const wwtMonthlyCost = 
      totalVCPU * costRates.vCPU +
      totalMemory * costRates.memory +
      totalStorage * costRates.storage;
    
    // Calculate annual costs
    const wwtAnnualCost = wwtMonthlyCost * 12;
    
    // Calculate DLA costs
    const dlaMonthlyCost = wwtMonthlyCost * (1 + pricing.fees.dlaFee);
    const dlaAnnualCost = dlaMonthlyCost * 12;
    
    // Calculate cloud provider costs
    const azureMonthlyCost = 
      totalVCPU * pricing.cloudCosts.azure.vCPU +
      totalMemory * pricing.cloudCosts.azure.memory +
      totalStorage * pricing.cloudCosts.azure.storage;
    
    const azureAnnualCost = azureMonthlyCost * 12;
    
    const awsMonthlyCost = 
      totalVCPU * pricing.cloudCosts.aws.vCPU +
      totalMemory * pricing.cloudCosts.aws.memory +
      totalStorage * pricing.cloudCosts.aws.storage;
    
    const awsAnnualCost = awsMonthlyCost * 12;
    
    // Calculate savings percentages
    const azureSavings = ((azureMonthlyCost - dlaMonthlyCost) / azureMonthlyCost * 100).toFixed(0);
    const awsSavings = ((awsMonthlyCost - dlaMonthlyCost) / awsMonthlyCost * 100).toFixed(0);
    
    // Prepare response
    const result = {
      configuration: {
        laaSOptions,
        totalVCPU,
        totalMemory,
        totalStorage,
        environmentSize
      },
      costs: {
        wwt: {
          monthly: wwtMonthlyCost,
          annual: wwtAnnualCost
        },
        dla: {
          monthly: dlaMonthlyCost,
          annual: dlaAnnualCost
        },
        azure: {
          monthly: azureMonthlyCost,
          annual: azureAnnualCost,
          savings: azureSavings
        },
        aws: {
          monthly: awsMonthlyCost,
          annual: awsAnnualCost,
          savings: awsSavings
        }
      }
    };
    
    // Log the calculated costs
    console.log('Calculated costs:', {
      wwt: {
        monthly: wwtMonthlyCost,
        annual: wwtAnnualCost
      },
      dla: {
        monthly: dlaMonthlyCost,
        annual: dlaAnnualCost
      }
    });
    
    // Filter out WWT costs for unauthenticated users, but include for all authenticated users
    if (!req.user) {
      console.log('User is not authenticated, removing WWT costs from response');
      delete result.costs.wwt;
    } else {
      console.log('User is authenticated, including WWT costs in response');
    }
    
    console.log('Sending successful response');
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Calculate costs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
