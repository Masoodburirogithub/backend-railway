// backend/src/routes/serviceRoutes.js
const express = require('express');
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, createService);
router.put('/:id', authenticate, authorizeAdmin, updateService);
router.delete('/:id', authenticate, authorizeAdmin, deleteService);

module.exports = router;