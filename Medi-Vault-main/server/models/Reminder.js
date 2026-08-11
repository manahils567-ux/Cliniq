const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['medicine', 'checkup'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    default: 'once'
  },
  times: [{
    hour: Number,
    minute: Number
  }],
  notificationMethod: {
    type: String,
    enum: ['push', 'sms', 'both'],
    default: 'push'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastNotified: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of active reminders
reminderSchema.index({ userId: 1, isActive: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder; 