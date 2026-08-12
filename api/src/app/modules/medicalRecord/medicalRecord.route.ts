import express from 'express';
import { auth } from '../../middlewares/auth';
import { MedicalRecordController } from './medicalRecord.controller';
import { CloudinaryHelper } from '../../../helpers/uploadHelper';

const router = express.Router();

router.post('/upload', auth('patient'), CloudinaryHelper.upload.single('file'), MedicalRecordController.uploadRecord);
router.post('/share', auth('patient'), MedicalRecordController.shareRecords);
router.get('/shared/appointment/:appointmentId', auth('doctor', 'patient'), MedicalRecordController.getSharedRecordsForAppointment);

// AI insights — these must be declared before '/:id' so they are not
// swallowed by the record-by-id route.
router.get('/insights', auth('patient'), MedicalRecordController.getInsights);
router.get('/insights/summary', auth('patient'), MedicalRecordController.getInsightSummary);
router.patch('/insights/:id', auth('patient'), MedicalRecordController.updateInsight);
router.post('/insights/:id/accept-reminder', auth('patient'), MedicalRecordController.acceptInsightReminder);
router.get('/trends', auth('patient'), MedicalRecordController.getMetricTrends);

router.get('/', auth('patient'), MedicalRecordController.getRecords);
router.get('/:id/analysis', auth('patient'), MedicalRecordController.getAnalysis);
router.post('/:id/analyze', auth('patient'), MedicalRecordController.reanalyzeRecord);
router.get('/:id', auth('patient'), MedicalRecordController.getRecord);
router.delete('/:id', auth('patient'), MedicalRecordController.deleteRecord);

export const MedicalRecordRouter = router;
