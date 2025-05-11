const express = require('express');
const router = express.Router();
const multer = require('multer');
const pantiController = require('../controllers/pantiController');
const { authenticate, authorizeAdmin, authorizeSuperAdmin } = require('../middlewares/authMiddleware');

// Setup multer for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/active', pantiController.getActivePanti);
router.get('/:pantiId', pantiController.getPantiById);

// Protected routes (Admin and SuperAdmin)
router.get('/', authenticate, authorizeAdmin, authorizeSuperAdmin, pantiController.getAllPanti);
router.post('/', authenticate, authorizeAdmin, authorizeSuperAdmin, upload.single('fotoUtama'), pantiController.createPanti);
router.put('/:pantiId', authenticate, authorizeAdmin, authorizeSuperAdmin, upload.single('fotoUtama'), pantiController.updatePanti);
router.delete('/:pantiId', authenticate, authorizeAdmin, authorizeSuperAdmin, pantiController.deletePanti);
router.patch('/:pantiId/status', authenticate, authorizeAdmin, authorizeSuperAdmin, pantiController.updatePantiStatus);

// Detail panti routes - now only updateDetailPanti is needed since createDetailPanti is done automatically
router.put('/:pantiId/detail', authenticate, authorizeAdmin, authorizeSuperAdmin, pantiController.updateDetailPanti);

// Keep this route for backward compatibility
router.get('/detail/:detailPantiId', pantiController.getDetailPantiById);

module.exports = router;