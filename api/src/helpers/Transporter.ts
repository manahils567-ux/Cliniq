import nodemailer from 'nodemailer';
import config from '../config';

/* Gmail is the default, not the only option. This was hardcoded to
   service: 'gmail', which meant the only way to send mail was a Google
   account with an app password — and when that credential is wrong, as it
   currently is, there is no way to route around it without a code change.
   Setting SMTP_HOST switches to any provider; leaving it unset keeps the
   existing Gmail behaviour, so this is backwards compatible. */
const smtpHost = process.env.SMTP_HOST;

export const Transporter = nodemailer.createTransport(
    smtpHost
        ? {
            host: smtpHost,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || config.gmail_app_Email,
                pass: process.env.SMTP_PASS || config.emailPass,
            },
        }
        : {
            service: 'gmail',
            auth: {
                user: config.gmail_app_Email,
                pass: config.emailPass,
            },
        }
);

/* Six modules send through this — contact, auth, appointments, reminders,
   doctor and newsletter — so bad credentials break all of them at once, and
   each one only finds out when a user triggers it. Checking once at boot
   turns that into a single loud line at startup instead of six silent
   failures spread across the app. Advisory only: it must not stop the
   server, since everything unrelated to mail still works. */
Transporter.verify()
    .then(() => console.log(`[mail] SMTP ready (${smtpHost || 'gmail'})`))
    .catch((error: unknown) => {
        const reason = error instanceof Error ? `${(error as any).code ?? ''} ${error.message}`.trim() : String(error);
        console.error(
            '[mail] SMTP unavailable — contact, auth, appointment, reminder and ' +
            'newsletter email will all fail until this is fixed:\n        ' + reason
        );
    });
