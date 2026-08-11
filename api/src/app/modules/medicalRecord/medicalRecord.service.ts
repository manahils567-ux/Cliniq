import prisma from '../../../shared/prisma';
import { CloudinaryHelper } from '../../../helpers/uploadHelper';
import { v2 as cloudinary } from 'cloudinary';
import config from '../../../config';

// Keep cloudinary configured (uploadHelper already does this, but ensure it's ready)
cloudinary.config({
    cloud_name: config.cloudinary.name,
    api_key: config.cloudinary.key,
    api_secret: config.cloudinary.secret,
});

const uploadRecord = async (patientId: string, file: Express.Multer.File, payload: any) => {
    const uploaded = await CloudinaryHelper.uploadFile(file);

    return prisma.medicalRecord.create({
        data: {
            patientId,
            title: payload.title || file.originalname,
            description: payload.description ?? null,
            date: payload.date ? new Date(payload.date) : new Date(),
            category: payload.category || 'Other',
            fileUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
        },
    });
};

const getRecords = async (patientId: string) => {
    return prisma.medicalRecord.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
    });
};

const getRecord = async (id: string, patientId: string) => {
    return prisma.medicalRecord.findFirst({ where: { id, patientId } });
};

const deleteRecord = async (id: string, patientId: string) => {
    const record = await prisma.medicalRecord.findFirst({ where: { id, patientId } });
    if (!record) return null;

    // Remove from Cloudinary
    try {
        await cloudinary.uploader.destroy(record.publicId);
    } catch (err) {
        console.error('[MedicalRecord] Cloudinary delete failed:', err);
    }

    return prisma.medicalRecord.delete({ where: { id } });
};

export const MedicalRecordService = { uploadRecord, getRecords, getRecord, deleteRecord };
