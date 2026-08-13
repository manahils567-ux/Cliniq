import nodemailer from 'nodemailer';
import config from '../config';

export const Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.gmail_app_Email,
        pass: config.emailPass
    }
});

/* Six modules send through this — contact, auth, appointments, reminders,
   doctor and newsletter — so bad credentials break all of them at once, and
   each one only finds out when a user triggers it. Checking once at boot
   turns that into a single loud line at startup instead of six silent
   failures spread across the app. Advisory only: it must not stop the
   server, since everything unrelated to mail still works. */
Transporter.verify()
    .then(() => console.log('[mail] SMTP ready'))
    .catch((error: unknown) => {
        const reason = error instanceof Error ? `${(error as any).code ?? ''} ${error.message}`.trim() : String(error);
        console.error(
            '[mail] SMTP unavailable — contact, auth, appointment, reminder and ' +
            'newsletter email will all fail until this is fixed:\n        ' + reason
        );
    });
