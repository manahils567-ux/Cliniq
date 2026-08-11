import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReminderService } from './reminder.service';

const getPatientId = (req: Request): string => (req.user as any)?.userId;

const createReminder = catchAsync(async (req: Request, res: Response) => {
    const patientId = getPatientId(req);
    const result = await ReminderService.createReminder(patientId, req.body);
    sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Reminder created', data: result });
});

const getReminders = catchAsync(async (req: Request, res: Response) => {
    const patientId = getPatientId(req);
    const result = await ReminderService.getReminders(patientId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Reminders fetched', data: result });
});

const updateReminder = catchAsync(async (req: Request, res: Response) => {
    const patientId = getPatientId(req);
    const result = await ReminderService.updateReminder(req.params.id, patientId, req.body);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Reminder updated', data: result });
});

const deleteReminder = catchAsync(async (req: Request, res: Response) => {
    const patientId = getPatientId(req);
    const result = await ReminderService.deleteReminder(req.params.id, patientId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Reminder deleted', data: result });
});

export const ReminderController = { createReminder, getReminders, updateReminder, deleteReminder };
