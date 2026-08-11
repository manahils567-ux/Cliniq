import express from 'express';
import { auth } from '../../middlewares/auth';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import prisma from '../../../shared/prisma';

const router = express.Router();

// GET /api/v1/ai/history — fetch last 50 messages for the patient
router.get('/history', auth('patient', 'doctor', 'admin'), catchAsync(async (req: any, res: any) => {
    const patientId = req.user?.userId;
    if (!patientId) return res.status(400).json({ success: false, message: 'No patient ID' });

    const messages = await prisma.chatMessage.findMany({
        where: { patientId },
        orderBy: { createdAt: 'asc' },
        take: 100,
    });

    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'History fetched', data: messages });
}));

// POST /api/v1/ai/history — save a message pair (user + bot)
router.post('/history', auth('patient', 'doctor', 'admin'), catchAsync(async (req: any, res: any) => {
    const patientId = req.user?.userId;
    const { userText, botText, specialist } = req.body;
    if (!patientId || !userText || !botText) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    await prisma.chatMessage.createMany({
        data: [
            { patientId, role: 'user', text: userText },
            { patientId, role: 'bot', text: botText, specialist: specialist ?? null },
        ],
    });

    sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Saved', data: null });
}));

// DELETE /api/v1/ai/history — clear all chat history for patient
router.delete('/history', auth('patient', 'doctor', 'admin'), catchAsync(async (req: any, res: any) => {
    const patientId = req.user?.userId;
    if (!patientId) return res.status(400).json({ success: false, message: 'No patient ID' });

    await prisma.chatMessage.deleteMany({ where: { patientId } });
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'History cleared', data: null });
}));

export { router as ChatHistoryRouter };
