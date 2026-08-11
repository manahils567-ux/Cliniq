import prisma from '../../../shared/prisma';
import { JwtHelper } from '../../../helpers/jwtHelper';
import { UserRole } from '@prisma/client';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';

export const googleLogin = async (payload: {
    idToken: string;       // actually the access_token from useGoogleLogin
    userInfo: {
        sub: string;
        email: string;
        given_name?: string;
        family_name?: string;
        picture?: string;
    };
}) => {
    const { email, given_name, family_name, picture } = payload.userInfo;

    if (!email) throw new Error('No email returned from Google');

    // Check if Auth record already exists
    let auth = await prisma.auth.findUnique({ where: { email } });

    if (!auth) {
        // New user — create Patient + Auth in one transaction
        const result = await prisma.$transaction(async (tx) => {
            const patient = await tx.patient.create({
                data: {
                    email,
                    firstName: given_name || email.split('@')[0],
                    lastName: family_name || '',
                    img: picture || null,
                },
            });

            const newAuth = await tx.auth.create({
                data: {
                    email,
                    password: '',           // Google users have no password
                    role: UserRole.patient,
                    userId: patient.id,
                },
            });

            return newAuth;
        });

        auth = result;
    }

    // Issue our own JWT — same shape as regular login
    const { role, userId, isDemo } = auth;
    const accessToken = JwtHelper.createToken(
        { role, userId, email, isDemo: false },
        config.jwt.secret as Secret,
        config.jwt.JWT_EXPIRES_IN as string
    );

    return {
        accessToken,
        user: { role, userId, email },
    };
};
