const express = require('express');
const router = express.Router();
const wilayahController = require('../controllers/wilayahController');
const { authenticate, authorizeAdmin, authorizeSuperAdmin } = require('../middlewares/authMiddleware');

// Routes untuk wilayah

router.post('/', authenticate, authorizeSuperAdmin, wilayahController.createWilayah);
router.get('/', authenticate, authorizeAdmin, wilayahController.getAllWilayah);
router.get('/active', wilayahController.getActiveWilayah);
router.get('/:wilayahId', authenticate, authorizeAdmin, wilayahController.getWilayahById);
router.delete('/:wilayahId', authenticate, authorizeSuperAdmin, wilayahController.deleteWilayah);

// Route untuk memperbarui wilayah pada daftar panti
router.put('/daftar-panti/:daftarPantiId', authenticate, authorizeAdmin, wilayahController.updateDaftarPantiWilayah);

// New route for updating a wilayah (name and status)
router.put('/:wilayahId', authenticate, authorizeSuperAdmin, wilayahController.updateWilayah);


module.exports = router;