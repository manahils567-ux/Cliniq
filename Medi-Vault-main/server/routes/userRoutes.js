const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/generate-qr', auth, userController.generateAccessQR);
router.post('/verify-qr', userController.verifyQRCode); // Removed auth middleware to allow public access
router.get('/access/:token', userController.handleQRRedirect); // New route for QR code redirect

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// Medical records routes
router.post('/medical-records', auth, upload.single('file'), userController.addMedicalRecord);
router.get('/medical-records', auth, userController.getMedicalRecords);

module.exports = router;