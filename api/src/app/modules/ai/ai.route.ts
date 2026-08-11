import express from 'express';
import { auth } from '../../middlewares/auth';
import { AiController } from './ai.controller';

const router = express.Router();

// POST /api/v1/ai/chat — patient must be logged in
router.post('/chat', auth('patient', 'doctor', 'admin'), AiController.chat);
router.post('/medical-history', auth('patient'), AiController.generateMedicalHistory);

export const AiRouter = router;
