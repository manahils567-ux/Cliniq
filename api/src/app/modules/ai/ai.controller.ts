import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AiService } from './ai.service';

const chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message, language = 'en' } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Please provide a valid message.',
            });
        }

        const userId = (req.user as any)?.userId;

        const result = await AiService.chat(message.trim(), language, userId);

        return res.status(httpStatus.OK).json({
            success: !result.error,
            data: { reply: result.reply, specialist: result.specialist ?? null },
        });
    } catch (error) {
        next(error);
    }
};

const generateMedicalHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)?.userId;
        const result = await AiService.generateMedicalHistory(userId);

        return res.status(httpStatus.OK).json({
            success: !result.error,
            data: { summary: result.summary },
        });
    } catch (error) {
        next(error);
    }
};

export const AiController = { chat, generateMedicalHistory };
