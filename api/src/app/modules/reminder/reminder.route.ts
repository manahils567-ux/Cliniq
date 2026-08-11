import express from 'express';
import { auth } from '../../middlewares/auth';
import { ReminderController } from './reminder.controller';

const router = express.Router();

router.post('/', auth('patient'), ReminderController.createReminder);
router.get('/', auth('patient'), ReminderController.getReminders);
router.patch('/:id', auth('patient'), ReminderController.updateReminder);
router.delete('/:id', auth('patient'), ReminderController.deleteReminder);

export const ReminderRouter = router;
