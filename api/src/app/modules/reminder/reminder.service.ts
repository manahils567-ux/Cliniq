import schedule from 'node-schedule';
import prisma from '../../../shared/prisma';
import { EmailtTransporter } from '../../../helpers/emailTransporter';
import * as path from 'path';

// In-memory job registry so we can cancel on update/delete
const scheduledJobs: Record<string, schedule.Job> = {};

// ── Email helper ───────────────────────────────────────────────────────────
const sendReminderEmail = async (reminderId: string) => {
    try {
        const reminder = await prisma.reminder.findUnique({
            where: { id: reminderId },
            include: { patient: { select: { firstName: true, lastName: true, email: true } } },
        });
        if (!reminder || !reminder.patient) return;

        const pathName = path.join(__dirname, '../../../../../template/reminder.html');
        await EmailtTransporter({
            pathName,
            replacementObj: {
                patientName: `${reminder.patient.firstName} ${reminder.patient.lastName}`,
                title: reminder.title,
                description: reminder.description ?? '',
                type: reminder.type,
                startDate: reminder.startDate.toLocaleString(),
                frequency: reminder.frequency,
            },
            toMail: reminder.patient.email,
            subject: `Reminder: ${reminder.title}`,
        });

        // Update lastNotified
        await prisma.reminder.update({
            where: { id: reminderId },
            data: { lastNotified: new Date() },
        });

        // Reschedule recurring reminders
        if (reminder.frequency !== 'once') {
            const updated = await prisma.reminder.findUnique({ where: { id: reminderId } });
            if (updated) scheduleReminderJob(updated);
        } else {
            // Deactivate one-time reminders after firing
            await prisma.reminder.update({ where: { id: reminderId }, data: { isActive: false } });
        }
    } catch (err) {
        console.error('[Reminder] Failed to send reminder email:', err);
    }
};

// ── Core scheduler ─────────────────────────────────────────────────────────
export const scheduleReminderJob = (reminder: any) => {
    // Cancel any existing job for this reminder
    if (scheduledJobs[reminder.id]) {
        scheduledJobs[reminder.id].cancel();
        delete scheduledJobs[reminder.id];
    }

    if (!reminder.isActive) return;

    const now = new Date();
    let nextFire = new Date(reminder.startDate);

    // If already past, compute the next occurrence based on frequency
    if (nextFire < now && reminder.lastNotified) {
        nextFire = new Date(reminder.lastNotified);
        const advance = () => {
            switch (reminder.frequency) {
                case 'daily':   nextFire.setDate(nextFire.getDate() + 1); break;
                case 'weekly':  nextFire.setDate(nextFire.getDate() + 7); break;
                case 'monthly': nextFire.setMonth(nextFire.getMonth() + 1); break;
                default: return; // once — nothing to do
            }
        };
        advance();
        while (nextFire < now) advance();
    }

    // If still in the past (one-time, never fired) schedule for +1 min
    if (nextFire < now) nextFire = new Date(now.getTime() + 60_000);

    // Respect endDate
    if (reminder.endDate && nextFire > new Date(reminder.endDate)) {
        prisma.reminder.update({ where: { id: reminder.id }, data: { isActive: false } }).catch(() => {});
        return;
    }

    const job = schedule.scheduleJob(reminder.id, nextFire, () => sendReminderEmail(reminder.id));
    if (job) scheduledJobs[reminder.id] = job;
};

// ── Re-schedule all active reminders on server boot ────────────────────────
export const initializeReminders = async () => {
    try {
        const active = await prisma.reminder.findMany({ where: { isActive: true } });
        active.forEach(scheduleReminderJob);
        console.log(`[Reminder] Scheduled ${active.length} active reminder(s).`);
    } catch (err) {
        console.error('[Reminder] Failed to initialize reminders:', err);
    }
};

// ── CRUD ───────────────────────────────────────────────────────────────────
const createReminder = async (patientId: string, payload: any) => {
    const reminder = await prisma.reminder.create({
        data: { ...payload, patientId, startDate: new Date(payload.startDate) },
    });
    scheduleReminderJob(reminder);
    return reminder;
};

const getReminders = async (patientId: string) => {
    return prisma.reminder.findMany({
        where: { patientId, isActive: true },
        orderBy: { startDate: 'asc' },
    });
};

const updateReminder = async (id: string, patientId: string, payload: any) => {
    const existing = await prisma.reminder.findFirst({ where: { id, patientId } });
    if (!existing) return null;

    const updated = await prisma.reminder.update({
        where: { id },
        data: { ...payload, startDate: payload.startDate ? new Date(payload.startDate) : undefined },
    });
    scheduleReminderJob(updated);
    return updated;
};

const deleteReminder = async (id: string, patientId: string) => {
    const existing = await prisma.reminder.findFirst({ where: { id, patientId } });
    if (!existing) return null;

    if (scheduledJobs[id]) {
        scheduledJobs[id].cancel();
        delete scheduledJobs[id];
    }
    return prisma.reminder.delete({ where: { id } });
};

export const ReminderService = { createReminder, getReminders, updateReminder, deleteReminder };
