import prisma from '../../../shared/prisma';
import { AiService, DocumentAnalysis } from '../ai/ai.service';
import { scheduleReminderJob } from '../reminder/reminder.service';

/**
 * Runs AI analysis on an uploaded document and persists everything derived from it:
 * the analysis, each extracted metric, and any alerts/suggestions/reminder proposals.
 *
 * Never throws — a failed analysis must not fail the upload that triggered it.
 */
const analyzeAndPersist = async (
    recordId: string,
    patientId: string,
    fileBuffer: Buffer,
    mimeType: string
) => {
    await prisma.medicalRecord
        .update({ where: { id: recordId }, data: { analysisStatus: 'processing' } })
        .catch(() => {});

    let analysis: DocumentAnalysis;
    try {
        analysis = await AiService.analyzeDocument(fileBuffer.toString('base64'), mimeType, patientId);
    } catch (err: any) {
        console.error('[RecordAnalysis] Unexpected analysis failure:', err?.message);
        await prisma.medicalRecord
            .update({ where: { id: recordId }, data: { analysisStatus: 'failed' } })
            .catch(() => {});
        return null;
    }

    if (analysis.error) {
        await prisma.medicalRecord
            .update({ where: { id: recordId }, data: { analysisStatus: 'failed' } })
            .catch(() => {});
        await prisma.recordAnalysis
            .upsert({
                where: { recordId },
                update: { status: 'failed', errorCode: analysis.error, rawText: analysis.rawText || null },
                create: {
                    recordId,
                    patientId,
                    documentType: 'other',
                    summary: 'Analysis could not be completed for this document.',
                    status: 'failed',
                    errorCode: analysis.error,
                    rawText: analysis.rawText || null,
                },
            })
            .catch(() => {});
        return null;
    }

    const record = await prisma.medicalRecord.findUnique({
        where: { id: recordId },
        select: { date: true },
    });
    const measuredAt = analysis.documentDate
        ? new Date(analysis.documentDate)
        : record?.date ?? new Date();
    const validMeasuredAt = isNaN(measuredAt.getTime()) ? new Date() : measuredAt;

    // Replace any previous analysis for this record so re-running is idempotent.
    // Metrics and insights cascade off RecordAnalysis.
    await prisma.$transaction(async (tx) => {
        await tx.recordAnalysis.deleteMany({ where: { recordId } });

        const created = await tx.recordAnalysis.create({
            data: {
                recordId,
                patientId,
                documentType: analysis.documentType,
                summary: analysis.summary || 'No summary produced.',
                plainSummary: analysis.plainSummary || null,
                findings: analysis.findings,
                concerns: analysis.concerns,
                suggestions: analysis.suggestions,
                rawText: analysis.rawText || null,
                status: 'completed',
            },
        });

        if (analysis.metrics.length) {
            await tx.healthMetric.createMany({
                data: analysis.metrics.map((m) => ({
                    analysisId: created.id,
                    recordId,
                    patientId,
                    key: m.key,
                    name: m.name,
                    value: m.value,
                    numericValue: m.numericValue ?? null,
                    unit: m.unit ?? null,
                    referenceRange: m.referenceRange ?? null,
                    status: m.status,
                    measuredAt: validMeasuredAt,
                })),
            });
        }

        if (analysis.insights.length) {
            await tx.healthInsight.createMany({
                data: analysis.insights.map((i) => ({
                    patientId,
                    analysisId: created.id,
                    recordId,
                    type: i.type,
                    severity: i.severity,
                    title: i.title,
                    message: i.message,
                    category: i.category ?? null,
                    suggestedReminder: i.suggestedReminder ?? undefined,
                })),
            });
        }

        await tx.medicalRecord.update({
            where: { id: recordId },
            data: { analysisStatus: 'completed' },
        });

        return created;
    });

    return getAnalysis(recordId, patientId);
};

const getAnalysis = async (recordId: string, patientId: string) => {
    return prisma.recordAnalysis.findFirst({
        where: { recordId, patientId },
        include: {
            metrics: { orderBy: { name: 'asc' } },
            insights: { orderBy: { createdAt: 'desc' } },
        },
    });
};

/** Re-run analysis on a record the patient already uploaded, re-fetching the stored file. */
const reanalyze = async (recordId: string, patientId: string) => {
    const record = await prisma.medicalRecord.findFirst({ where: { id: recordId, patientId } });
    if (!record) return null;

    const response = await fetch(record.fileUrl);
    if (!response.ok) {
        throw new Error(`Could not retrieve the stored file (HTTP ${response.status}).`);
    }
    const mimeType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await response.arrayBuffer());

    return analyzeAndPersist(recordId, patientId, buffer, mimeType);
};

// ── Insights feed ─────────────────────────────────────────────────────────
const SEVERITY_RANK: Record<string, number> = {
    critical: 0,
    high: 1,
    moderate: 2,
    low: 3,
    info: 4,
};

const getInsights = async (patientId: string, status?: string) => {
    const insights = await prisma.healthInsight.findMany({
        where: { patientId, ...(status ? { status } : {}) },
        include: {
            record: { select: { id: true, title: true, category: true, date: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Most severe first, newest first within a severity
    return insights.sort(
        (a, b) => (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9)
    );
};

const updateInsightStatus = async (id: string, patientId: string, status: string) => {
    const existing = await prisma.healthInsight.findFirst({ where: { id, patientId } });
    if (!existing) return null;
    return prisma.healthInsight.update({ where: { id }, data: { status } });
};

/**
 * Turns an insight's reminder proposal into a real, scheduled Reminder.
 * Idempotent: accepting twice returns the reminder already created.
 */
const acceptInsightReminder = async (id: string, patientId: string) => {
    const insight = await prisma.healthInsight.findFirst({ where: { id, patientId } });
    if (!insight) return null;

    if (insight.reminderId) {
        const existing = await prisma.reminder.findUnique({ where: { id: insight.reminderId } });
        if (existing) return existing;
    }

    const spec = insight.suggestedReminder as any;
    if (!spec || !spec.title) {
        throw new Error('This insight has no reminder attached.');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (Number(spec.startOffsetDays) || 1));

    // Guard against an end date at or before the start — the scheduler would
    // deactivate such a reminder before it ever fired.
    let endDate: Date | null = null;
    if (spec.endOffsetDays !== null && spec.endOffsetDays !== undefined) {
        const candidate = new Date();
        candidate.setDate(candidate.getDate() + Number(spec.endOffsetDays));
        if (candidate > startDate) endDate = candidate;
    }

    const reminder = await prisma.reminder.create({
        data: {
            patientId,
            type: spec.type || 'checkup',
            title: spec.title,
            description: spec.description || insight.message,
            startDate,
            endDate,
            frequency: spec.frequency || 'once',
            notificationMethod: 'email',
            isActive: true,
        },
    });

    scheduleReminderJob(reminder);

    await prisma.healthInsight.update({
        where: { id },
        data: { status: 'accepted', reminderId: reminder.id },
    });

    return reminder;
};

// ── Trends ────────────────────────────────────────────────────────────────
/** Groups a patient's extracted metrics by key so the UI can chart them over time. */
const getMetricTrends = async (patientId: string, key?: string) => {
    const metrics = await prisma.healthMetric.findMany({
        where: { patientId, ...(key ? { key } : {}) },
        orderBy: { measuredAt: 'asc' },
        include: { record: { select: { id: true, title: true } } },
    });

    const grouped: Record<string, any> = {};
    for (const m of metrics) {
        if (!grouped[m.key]) {
            grouped[m.key] = { key: m.key, name: m.name, unit: m.unit, points: [] };
        }
        grouped[m.key].points.push({
            value: m.value,
            numericValue: m.numericValue,
            status: m.status,
            referenceRange: m.referenceRange,
            measuredAt: m.measuredAt,
            recordId: m.recordId,
            recordTitle: m.record?.title ?? null,
        });
    }

    return Object.values(grouped);
};

/** Counts for dashboard badges. */
const getInsightSummary = async (patientId: string) => {
    const [total, unread, critical, analyzed] = await Promise.all([
        prisma.healthInsight.count({ where: { patientId } }),
        prisma.healthInsight.count({ where: { patientId, status: 'new' } }),
        prisma.healthInsight.count({
            where: { patientId, status: { not: 'dismissed' }, severity: { in: ['high', 'critical'] } },
        }),
        prisma.recordAnalysis.count({ where: { patientId, status: 'completed' } }),
    ]);
    return { total, unread, critical, analyzedRecords: analyzed };
};

export const RecordAnalysisService = {
    analyzeAndPersist,
    getAnalysis,
    reanalyze,
    getInsights,
    updateInsightStatus,
    acceptInsightReminder,
    getMetricTrends,
    getInsightSummary,
};
