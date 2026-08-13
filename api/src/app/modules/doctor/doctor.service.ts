import { Doctor, UserRole } from "@prisma/client";
import prisma from "../../../shared/prisma";
import bcrypt from 'bcrypt';
import ApiError from "../../../errors/apiError";
import httpStatus from "http-status";
import { DoctorSearchableFields, IDoctorFilters } from "./doctor.interface";
import calculatePagination, { IOption } from "../../../shared/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { Request } from "express";
import { IUpload } from "../../../interfaces/file";
import { CloudinaryHelper } from "../../../helpers/uploadHelper";
import moment from "moment";
import { EmailtTransporter } from "../../../helpers/emailTransporter";
import * as path from "path";
import config from "../../../config";
const { v4: uuidv4 } = require('uuid');

const sendVerificationEmail = async (data: Doctor) => {
    const currentUrl = process.env.NODE_ENV === 'production' ? config.backendLiveUrl : config.backendLocalUrl;
    const uniqueString = uuidv4() + data.id;
    const uniqueStringHashed = await bcrypt.hashSync(uniqueString, 12);
    const url = `${currentUrl}user/verify/${data.id}/${uniqueString}`
    const expiresDate = moment().add(6, 'hours')
    const verficationData = await prisma.userVerfication.create({
        data: {
            userId: data.id,
            expiresAt: expiresDate.toDate(),
            uniqueString: uniqueStringHashed
        }
    })
    if (verficationData) {
        const pathName = path.join(__dirname, '../../../../template/verify.html',)
        const obj = {link: url};
        const subject = "Email Verification"
        const toMail = data.email;
        try{
            await EmailtTransporter({pathName, replacementObj: obj, toMail, subject})
        }catch(err){
            console.log(err);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to send email !');
        }
    }
}

const create = async (payload: any): Promise<any> => {
    const data = await prisma.$transaction(async (tx) => {
        const { password, ...othersData } = payload;
        const existEmail = await tx.auth.findUnique({ where: { email: othersData.email } });
        if (existEmail) {
            throw new Error("Email Already Exist !!")
        }
        const doctor = await tx.doctor.create({ data: othersData });
        await tx.auth.create({
            data: {
                email: doctor.email,
                password: password && await bcrypt.hashSync(password, 12),
                role: UserRole.doctor,
                userId: doctor.id
            },
        });
        return doctor
    });

    if (data.id) {
        try {
            await sendVerificationEmail(data);
        } catch (err) {
            console.error('[Doctor Signup] Verification email failed:', err);
            // Don't block signup if email fails — doctor can still be created
        }
    }
    return data;

}

const getAllDoctors = async (filters: IDoctorFilters, options: IOption): Promise<IGenericResponse<Doctor[]>> => {
    const { limit, page, skip } = calculatePagination(options);
    const { searchTerm, max, min, specialist, ...filterData } = filters;

    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            OR: DoctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        andCondition.push({
            AND: Object.entries(filterData).map(([key, value]) => ({
                [key]: { equals: value }
            }))
        })
    }

    if (min || max) {
        andCondition.push({
            AND: ({
                price: {
                    gte: min,
                    lte: max
                }
            })
        })
    }

    if (specialist) {
        // The Specialty filter sends the value from Doctor.specialization, but
        // this only ever matched Doctor.services — so picking a speciality
        // always returned nothing. Match either column, case-insensitively.
        andCondition.push({
            OR: [
                { specialization: { contains: specialist, mode: 'insensitive' as const } },
                { services: { contains: specialist, mode: 'insensitive' as const } },
            ]
        })
    }

    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = await prisma.doctor.findMany({
        skip,
        take: limit,
        where: whereCondition,
    });

    const total = await prisma.doctor.count({ where: whereCondition });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result
    }
}

const getDoctor = async (id: string): Promise<Doctor | null> => {
    const result = await prisma.doctor.findUnique({
        where: {
            id: id
        }
    });
    return result;
}

const deleteDoctor = async (id: string): Promise<any> => {
    const result = await prisma.$transaction(async (tx) => {
        const patient = await tx.doctor.delete({
            where: {
                id: id
            }
        });
        await tx.auth.delete({
            where: {
                email: patient.email
            }
        })
    });
    return result;
}

const updateDoctor = async (req: Request): Promise<Doctor> => {
    const file = req.file as IUpload;
    const id = req.params.id as string;
    // A doctor may only edit their own profile — the id in the URL must match the token.
    const authUser = req.user as { userId?: string } | undefined;
    if (authUser?.userId !== id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You can only update your own profile !!');
    }
    const user = JSON.parse(req.body.data);

    if (file) {
        const uploadImage = await CloudinaryHelper.uploadFile(file);
        if (uploadImage) {
            user.img = uploadImage.secure_url
        } else {
            throw new ApiError(httpStatus.EXPECTATION_FAILED, 'Failed to Upload Image');
        }
    }
    const result = await prisma.doctor.update({
        where: { id },
        data: user
    })
    return result;
}

/**
 * Public counters for the landing page trust strip.
 * `star` is stored as a String, so the average is computed in JS rather than
 * with an aggregate — the column cannot be averaged in SQL as-is.
 */
const getPlatformStats = async () => {
    const [doctors, patients, specialisations, reviews] = await Promise.all([
        prisma.doctor.count(),
        prisma.patient.count(),
        prisma.doctor.findMany({
            where: { specialization: { not: null } },
            select: { specialization: true },
            distinct: ['specialization'],
        }),
        prisma.reviews.findMany({ select: { star: true } }),
    ]);

    const stars = reviews
        .map((r) => Number(r.star))
        .filter((n) => Number.isFinite(n) && n > 0);

    const avgRating = stars.length
        ? Number((stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(1))
        : null;

    return {
        doctors,
        patients,
        specialities: specialisations.filter((s) => (s.specialization || '').trim()).length,
        avgRating,
        reviews: stars.length,
    };
};

/**
 * Distinct specialities with a doctor count, for the services page.
 * Returns [] when no doctor has one set — the UI says so rather than
 * inventing a list.
 */
const getSpecialities = async () => {
    const grouped = await prisma.doctor.groupBy({
        by: ['specialization'],
        where: { specialization: { not: null } },
        _count: { _all: true },
    });

    return grouped
        .map((g) => ({ name: (g.specialization || '').trim(), doctors: g._count._all }))
        .filter((s) => s.name.length > 0)
        .sort((a, b) => b.doctors - a.doctors || a.name.localeCompare(b.name));
};

export const DoctorService = {
    create,
    updateDoctor,
    deleteDoctor,
    getAllDoctors,
    getDoctor,
    getPlatformStats,
    getSpecialities
}