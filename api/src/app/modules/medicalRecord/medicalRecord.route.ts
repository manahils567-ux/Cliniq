import express from 'express';
import { auth } from '../../middlewares/auth';
import { MedicalRecordController } from './medicalRecord.controller';
import { CloudinaryHelper } from '../../../helpers/uploadHelper';

const router = express.Router();

router.post('/upload', auth('patient'), CloudinaryHelper.upload.single('file'), MedicalRecordController.uploadRecord);
router.get('/', auth('patient'), MedicalRecordController.getRecords);
router.get('/:id', auth('patient'), MedicalRecordController.getRecord);
router.delete('/:id', auth('patient'), MedicalRecordController.deleteRecord);

export const MedicalRecordRouter = router;
