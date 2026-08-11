const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Reminder routes
router.post('/', reminderController.createReminder);
router.get('/', reminderController.getReminders);
router.patch('/:id', reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);

module.exports = router; 