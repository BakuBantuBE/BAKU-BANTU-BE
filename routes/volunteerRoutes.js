const express = require('express');
const router = express.Router();
const multer = require('multer');
const volunteerController = require('../controllers/volunteerController');
const { authenticate, authorizeSuperAdmin } = require('../middlewares/authMiddleware');

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

// Public route for volunteer registration - now with file upload
router.post('/register', upload.single('profileImage'), volunteerController.registerVolunteer);
router.get('/active', volunteerController.getActiveVolunteers); // Public endpoint for active volunteers

// Protected routes (SUPERADMIN only)
router.get('/', authenticate, authorizeSuperAdmin, volunteerController.getAllVolunteers);
router.get('/:volunteerId', authenticate, authorizeSuperAdmin, volunteerController.getVolunteerById);
router.put('/:volunteerId', authenticate, authorizeSuperAdmin, upload.single('profileImage'), volunteerController.updateVolunteer);

// New route for making a volunteer into an admin
router.post('/:volunteerId', authenticate, authorizeSuperAdmin, volunteerController.createAdminFromVolunteer);

module.exports = router;