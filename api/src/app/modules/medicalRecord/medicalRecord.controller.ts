import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MedicalRecordService } from './medicalRecord.service';
import ApiError from '../../../errors/apiError';

const getPatientId = (req: Request): string => (req.user as any)?.userId;

const uploadRecord = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    const patientId = getPatientId(req);
    const result = await MedicalRecordService.uploadRecord(patientId, req.file, req.body);
    sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Record uploaded', data: result });
});

const getRecords = catchAsync(async (req: Request, res: Response) => {
    const patientId = getPatientId(req);
    const result = await MedicalRecordService.getRecords(patientId);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Records fetched', data: result });
});

const getRecord = catchAsync(async (req: Request, res: Response) => {
    const patientId = getPatientId(req);
    const result = await MedicalRecordService.getRecord(req.params.id, patientId);
    if (!result) throw new ApiError(httpStatus.NOT_FOUND, 'Record not found');
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Record fetched', data: result });
});

const deleteRecord = catchAsync(async (req: Request, res: Response) => {
    const patientId = getPatientId(req);
    const result = await MedicalRecordService.deleteRecord(req.params.id, patientId);
    if (!result) throw new ApiError(httpStatus.NOT_FOUND, 'Record not found');
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Record deleted', data: result });
});

const shareRecords = catchAsync(async (req: Request, res: Response) => {
    const patientId = getPatientId(req);
    const result = await MedicalRecordService.shareRecords(patientId, req.body);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Records shared successfully', data: result });
});

const getSharedRecordsForAppointment = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as any)?.userId;
    const role = (req.user as any)?.role;
    const { appointmentId } = req.params;
    const result = await MedicalRecordService.getSharedRecordsForAppointment(appointmentId, userId, role);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Shared records fetched', data: result });
});

export const MedicalRecordController = {
    uploadRecord,
    getRecords,
    getRecord,
    deleteRecord,
    shareRecords,
    getSharedRecordsForAppointment,
};
