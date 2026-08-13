import express from 'express';
import { AuthController } from './auth.controller';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { googleLogin } from './googleAuth.service';
import { auth } from '../../middlewares/auth';
import { AuthUser } from '../../../enums';

const router = express.Router();

router.post('/login', AuthController.Login);
/* Signed-in password change. Every role, since anyone with an account can
   change their own — the service scopes it to the token's own user. */
router.patch(
    '/change-password',
    auth(AuthUser.DOCTOR, AuthUser.PATIENT, AuthUser.ADMIN, AuthUser.SUPER_ADMIN),
    AuthController.ChangePassword
);
router.post('/reset-password', AuthController.resetPassword);
router.post('/reset-password/confirm', AuthController.PasswordResetConfirm);
router.get('/user/verify/:userId/:uniqueString', AuthController.VerifyUser);
router.get('/verified', AuthController.Verified);
router.get('/expired/link', AuthController.VerficationExpired);

// Google OAuth
router.post('/google', catchAsync(async (req: any, res: any) => {
    const { idToken, userInfo } = req.body;
    if (!userInfo?.email) return res.status(400).json({ success: false, message: 'userInfo is required' });
    const result = await googleLogin({ idToken, userInfo });
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Google login successful', data: result });
}));

export const AuthRouter = router;