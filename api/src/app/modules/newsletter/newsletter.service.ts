import ApiError from '../../../errors/apiError';
import httpStatus from 'http-status';
import config from '../../../config';
import { Transporter } from '../../../helpers/Transporter';

interface SubscribePayload {
    email: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Notifies the admin inbox of a new signup. There is no subscriber table yet —
 * see the note in newsletter.route.ts before swapping this for real storage.
 */
const subscribe = async (payload: SubscribePayload): Promise<{ message: string }> => {
    const email = (payload?.email || '').trim().toLowerCase();

    if (!email || !EMAIL_PATTERN.test(email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'A valid email address is required !!');
    }

    const recipient = config.adminEmail || config.gmail_app_Email;
    if (!recipient) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'No admin recipient configured !!');
    }

    try {
        await Transporter.sendMail({
            from: `"Cliniq" <${config.gmail_app_Email}>`,
            to: recipient,
            subject: 'New newsletter subscriber',
            text: `${email} subscribed to the Cliniq newsletter.`,
        });
        return { message: 'Successfully subscribed !!' };
    } catch (error) {
        /* Log the cause. This previously threw the generic message and
           discarded `error`, so a failing subscribe was undiagnosable from
           the server output — the actual reason was an SMTP EAUTH, which
           nothing surfaced. The address is not logged: it is the very piece
           of personal data the caller just handed us. */
        const reason = error instanceof Error ? `${(error as any).code ?? ''} ${error.message}`.trim() : String(error);
        console.error('[newsletter] sendMail failed:', reason);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to subscribe right now !!');
    }
};

export const NewsletterService = {
    subscribe,
};
