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

const shareRecords = async (
    patientId: string,
    payload: { recordIds: string[]; appointmentId?: string; doctorId?: string }
) => {
    const { recordIds, appointmentId, doctorId } = payload;
    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
        return [];
    }

    // Verify all records belong to this patient
    const existingRecords = await prisma.medicalRecord.findMany({
        where: { id: { in: recordIds }, patientId },
        select: { id: true },
    });

    if (existingRecords.length !== recordIds.length) {
        throw new Error('One or more selected records are invalid or do not belong to you.');
    }

    // Resolve doctorId if appointmentId is given
    let targetDoctorId = doctorId;
    if (appointmentId && !targetDoctorId) {
        const appointment = await prisma.appointments.findUnique({
            where: { id: appointmentId },
            select: { doctorId: true },
        });
        targetDoctorId = appointment?.doctorId || undefined;
    }

    // Create shared records using transaction to skip duplicates gracefully
    const createdShares = await prisma.$transaction(
        recordIds.map((recordId) =>
            prisma.sharedMedicalRecord.upsert({
                where: {
                    medicalRecordId_appointmentId: {
                        medicalRecordId: recordId,
                        appointmentId: appointmentId || '',
                    },
                },
                update: {},
                create: {
                    medicalRecordId: recordId,
                    appointmentId: appointmentId || null,
                    doctorId: targetDoctorId || null,
                    patientId,
                },
            })
        )
    );

    return createdShares;
};

const getSharedRecordsForAppointment = async (
    appointmentId: string,
    userId: string,
    userRole: string
) => {
    // Security check: verify authorization for this appointment
    const appointment = await prisma.appointments.findUnique({
        where: { id: appointmentId },
        select: { doctorId: true, patientId: true },
    });

    if (!appointment) return [];

    if (userRole === 'doctor' && appointment.doctorId !== userId) {
        return []; // Doctor not assigned to this appointment cannot view
    }
    if (userRole === 'patient' && appointment.patientId !== userId) {
        return []; // Patient not owner of appointment cannot view
    }

    const shared = await prisma.sharedMedicalRecord.findMany({
        where: { appointmentId },
        include: {
            medicalRecord: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return shared.map((s) => s.medicalRecord);
};

export const MedicalRecordService = {
    uploadRecord,
    getRecords,
    getRecord,
    deleteRecord,
    shareRecords,
    getSharedRecordsForAppointment,
};
