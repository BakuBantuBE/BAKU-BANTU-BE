const express = require('express');
const router = express.Router();
const yayasanController = require('../controllers/yayasanController');
const { authenticate, authorizeAdmin, authorizeSuperAdmin } = require('../middlewares/authMiddleware');

// Routes untuk yayasan

// Public route to get active yayasan
router.get('/active', yayasanController.getActiveYayasan);

// Protected routes (Admin and SuperAdmin)
router.get('/', authenticate, authorizeAdmin, yayasanController.getAllYayasan);
router.get('/:yayasanId', authenticate, authorizeAdmin, yayasanController.getYayasanById);

// SuperAdmin only routes
router.post('/', authenticate, authorizeSuperAdmin, yayasanController.createYayasan);
router.put('/:yayasanId', authenticate, authorizeSuperAdmin, yayasanController.updateYayasan);
router.delete('/:yayasanId', authenticate, authorizeSuperAdmin, yayasanController.deleteYayasan);
router.patch('/:yayasanId/status', authenticate, authorizeSuperAdmin, yayasanController.updateYayasanStatus);

module.exports = router;