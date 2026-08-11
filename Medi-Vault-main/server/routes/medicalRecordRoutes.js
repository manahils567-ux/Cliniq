const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  uploadMedicalRecord,
  getMedicalRecords,
  getMedicalRecord,
  deleteMedicalRecord
} = require('../controllers/medicalRecordController');

// Protected routes - require authentication
router.use(auth);

// Upload a new medical record
router.post('/upload', upload.single('file'), uploadMedicalRecord);

// Get all medical records for a user
router.get('/', getMedicalRecords);

// Get a specific medical record
router.get('/:id', getMedicalRecord);

// Delete a medical record
router.delete('/:id', deleteMedicalRecord);

module.exports = router;