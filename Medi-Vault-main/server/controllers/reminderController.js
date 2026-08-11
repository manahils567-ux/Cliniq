const Reminder = require('../models/Reminder');
const User = require('../models/User');
const schedule = require('node-schedule');
const admin = require('firebase-admin');
const twilio = require('twilio');

// Initialize Twilio client
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Update the initializeReminders function to return a Promise
const initializeReminders = async () => {
  try {
    console.log('Initializing active reminders...');
    const activeReminders = await Reminder.find({ isActive: true });
    console.log(`Found ${activeReminders.length} active reminders to schedule`);
    
    for (const reminder of activeReminders) {
      await scheduleReminder(reminder);
    }
    
    console.log('All active reminders have been scheduled');
    return true; // Successfully initialized
  } catch (error) {
    console.error('Error initializing reminders:', error);
    throw error; // Re-throw the error to be caught in startServer
  }
};

// Schedule reminder notifications
const scheduleReminder = async (reminder) => {
  try {
    // Calculate the next notification time based on reminder settings
    const now = new Date();
    let scheduledTime = new Date(reminder.startDate);
    
    // Make sure we have the times array with correct values
    if (!reminder.times || reminder.times.length === 0) {
      reminder.times = [{ 
        hour: scheduledTime.getHours(), 
        minute: scheduledTime.getMinutes() 
      }];
      await reminder.save();
    }
    
    // If reminder has already started and has a lastNotified date, calculate next occurrence
    if (now > scheduledTime && reminder.lastNotified) {
      scheduledTime = new Date(reminder.lastNotified);
      
      switch (reminder.frequency) {
        case 'daily':
          scheduledTime.setDate(scheduledTime.getDate() + 1);
          break;
        case 'weekly':
          scheduledTime.setDate(scheduledTime.getDate() + 7);
          break;
        case 'monthly':
          scheduledTime.setMonth(scheduledTime.getMonth() + 1);
          break;
        case 'once':
          // For one-time reminders that have been notified, no further scheduling
          return;
      }
    }
    
    // If the calculated time is in the past, move it to the next occurrence
    if (scheduledTime < now) {
      // For recurring reminders, find the next occurrence
      if (reminder.frequency !== 'once') {
        while (scheduledTime < now) {
          switch (reminder.frequency) {
            case 'daily':
              scheduledTime.setDate(scheduledTime.getDate() + 1);
              break;
            case 'weekly':
              scheduledTime.setDate(scheduledTime.getDate() + 7);
              break;
            case 'monthly':
              scheduledTime.setMonth(scheduledTime.getMonth() + 1);
              break;
          }
        }
      } else {
        // For one-time reminders, if the time is in the past, only schedule if it hasn't been notified yet
        if (reminder.lastNotified) {
          console.log(`One-time reminder ${reminder._id} has already been notified, not rescheduling`);
          return;
        }
        // If it's in the past and hasn't been notified, schedule it for now + 1 minute
        scheduledTime = new Date(now.getTime() + 60000);
      }
    }
    
    // Check if reminder has an end date and if we've passed it
    if (reminder.endDate && scheduledTime > new Date(reminder.endDate)) {
      console.log(`Reminder ${reminder._id} has passed its end date, marking as inactive`);
      reminder.isActive = false;
      await reminder.save();
      return;
    }
    
    console.log(`Scheduling reminder ${reminder._id} for ${scheduledTime.toISOString()}`);

    // Cancel any existing job for this reminder
    const existingJob = schedule.scheduledJobs[reminder._id.toString()];
    if (existingJob) {
      existingJob.cancel();
    }

    // Create the scheduled job
    const job = schedule.scheduleJob(reminder._id.toString(), scheduledTime, async () => {
      try {
        // Get user's FCM token and phone number
        const user = await User.findById(reminder.userId).select('phoneNumber fcmToken');
        
        if (!user) {
          console.error(`User ${reminder.userId} not found for reminder notification`);
          return;
        }
        
        if (reminder.notificationMethod === 'push' || reminder.notificationMethod === 'both') {
          // Send Firebase push notification
          if (user.fcmToken) {
            try {
              await admin.messaging().send({
                token: user.fcmToken,
                notification: {
                  title: reminder.title,
                  body: reminder.description || 'Time for your reminder!'
                }
              });
              console.log(`Push notification sent for reminder ${reminder._id}`);
            } catch (error) {
              console.error(`Error sending push notification: ${error.message}`);
            }
          } else {
            console.log(`No FCM token available for user ${reminder.userId}`);
          }
        }

        if (reminder.notificationMethod === 'sms' || reminder.notificationMethod === 'both') {
          // Send SMS via Twilio
          if (twilioClient && user.phoneNumber) {
            try {
              await twilioClient.messages.create({
                body: `${reminder.title}: ${reminder.description || 'Time for your reminder!'}`,
                to: user.phoneNumber,
                from: process.env.TWILIO_PHONE_NUMBER
              });
              console.log(`SMS sent for reminder ${reminder._id}`);
            } catch (error) {
              console.error(`Error sending SMS: ${error.message}`);
            }
          } else {
            console.log(`Twilio client or phone number not available for user ${reminder.userId}`);
          }
        }

        // Update last notified time
        reminder.lastNotified = new Date();
        await reminder.save();

        // Schedule next reminder if recurring
        if (reminder.frequency !== 'once') {
          scheduleReminder(reminder);
        }
      } catch (error) {
        console.error('Error sending reminder notification:', error);
      }
    });

    return job;
  } catch (error) {
    console.error(`Error scheduling reminder ${reminder._id}:`, error);
  }
};

// Schedule next occurrence for recurring reminders
const scheduleNextReminder = (reminder) => {
  const now = new Date();
  let nextDate = new Date(reminder.lastNotified);

  switch (reminder.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  if (reminder.endDate && nextDate > reminder.endDate) {
    reminder.isActive = false;
    reminder.save();
    return;
  }

  scheduleReminder(reminder);
};

// Create new reminder
exports.createReminder = async (req, res) => {
  try {
    const reminderData = {
      ...req.body,
      userId: req.user._id
    };

    const reminder = new Reminder(reminderData);
    await reminder.save();

    // Make sure reminder is scheduled after creation
    if (reminder.isActive) {
      await scheduleReminder(reminder);
    }

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating reminder', error: error.message });
  }
};

// Get all reminders for a user
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      userId: req.user._id,
      isActive: true
    }).sort({ startDate: 1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reminders', error: error.message });
  }
};

// Update reminder
exports.updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Cancel existing schedule
    const existingJob = schedule.scheduledJobs[reminder._id.toString()];
    if (existingJob) {
      existingJob.cancel();
    }

    // Update reminder
    const updates = Object.keys(req.body);
    updates.forEach(update => reminder[update] = req.body[update]);
    await reminder.save();

    // Reschedule if active
    if (reminder.isActive) {
      await scheduleReminder(reminder);
    }

    res.json({
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating reminder', error: error.message });
  }
};

// Delete reminder
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Cancel scheduled job
    const existingJob = schedule.scheduledJobs[reminder._id.toString()];
    if (existingJob) {
      existingJob.cancel();
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting reminder', error: error.message });
  }
};

// Export the initializeReminders function
exports.initializeReminders = initializeReminders;