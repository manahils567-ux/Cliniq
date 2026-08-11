import express from 'express';
import { auth } from '../../middlewares/auth';
import { AiController } from './ai.controller';
import { ChatHistoryRouter } from './chatHistory.route';

const router = express.Router();

router.post('/chat', auth('patient', 'doctor', 'admin'), AiController.chat);
router.post('/medical-history', auth('patient'), AiController.generateMedicalHistory);
router.use(ChatHistoryRouter);

export const AiRouter = router;
