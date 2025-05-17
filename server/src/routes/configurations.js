const express = require('express');
const {
  getConfigurations,
  getPublicConfigurations,
  getConfiguration,
  getConfigurationByLink,
  createConfiguration,
  updateConfiguration,
  revertVersion,
  deleteConfiguration
} = require('../controllers/configurations');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Public routes
router.get('/public', getPublicConfigurations);
router.get('/share/:link', getConfigurationByLink);

// Protected routes
router.get('/', protect, getConfigurations);
router.get('/:id', protect, getConfiguration);
router.post('/', protect, createConfiguration);
router.put('/:id', protect, updateConfiguration);
router.put('/:id/revert/:versionIndex', protect, revertVersion);
router.delete('/:id', protect, deleteConfiguration);

module.exports = router;
