-- AI document analysis feature — additive only.
-- Creates 3 new tables and adds 1 nullable-with-default column to MedicalRecord.
-- Safe to re-run: every statement is guarded.

BEGIN;

-- 1. Track analysis state on the existing record table
ALTER TABLE "MedicalRecord"
  ADD COLUMN IF NOT EXISTS "analysisStatus" TEXT NOT NULL DEFAULT 'pending';

-- 2. The analysis itself (one per record)
CREATE TABLE IF NOT EXISTS "RecordAnalysis" (
  "id"           TEXT NOT NULL,
  "recordId"     TEXT NOT NULL,
  "patientId"    TEXT NOT NULL,
  "documentType" TEXT NOT NULL DEFAULT 'other',
  "summary"      TEXT NOT NULL,
  "plainSummary" TEXT,
  "findings"     JSONB,
  "concerns"     JSONB,
  "suggestions"  JSONB,
  "rawText"      TEXT,
  "modelUsed"    TEXT NOT NULL DEFAULT 'gemini-3.5-flash',
  "status"       TEXT NOT NULL DEFAULT 'completed',
  "errorCode"    TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RecordAnalysis_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RecordAnalysis_recordId_fkey" FOREIGN KEY ("recordId")
    REFERENCES "MedicalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "RecordAnalysis_recordId_key" ON "RecordAnalysis"("recordId");
CREATE INDEX IF NOT EXISTS "RecordAnalysis_patientId_idx" ON "RecordAnalysis"("patientId");

-- 3. Individual measurements, kept for trending over time
CREATE TABLE IF NOT EXISTS "HealthMetric" (
  "id"             TEXT NOT NULL,
  "analysisId"     TEXT NOT NULL,
  "recordId"       TEXT NOT NULL,
  "patientId"      TEXT NOT NULL,
  "key"            TEXT NOT NULL,
  "name"           TEXT NOT NULL,
  "value"          TEXT NOT NULL,
  "numericValue"   DOUBLE PRECISION,
  "unit"           TEXT,
  "referenceRange" TEXT,
  "status"         TEXT NOT NULL DEFAULT 'unknown',
  "measuredAt"     TIMESTAMP(3) NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HealthMetric_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "HealthMetric_analysisId_fkey" FOREIGN KEY ("analysisId")
    REFERENCES "RecordAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HealthMetric_recordId_fkey" FOREIGN KEY ("recordId")
    REFERENCES "MedicalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HealthMetric_patientId_fkey" FOREIGN KEY ("patientId")
    REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "HealthMetric_patientId_key_idx" ON "HealthMetric"("patientId", "key");
CREATE INDEX IF NOT EXISTS "HealthMetric_analysisId_idx" ON "HealthMetric"("analysisId");

-- 4. Alerts / suggestions / reminder proposals derived from reports
CREATE TABLE IF NOT EXISTS "HealthInsight" (
  "id"                TEXT NOT NULL,
  "patientId"         TEXT NOT NULL,
  "analysisId"        TEXT,
  "recordId"          TEXT,
  "type"              TEXT NOT NULL,
  "severity"          TEXT NOT NULL DEFAULT 'info',
  "title"             TEXT NOT NULL,
  "message"           TEXT NOT NULL,
  "category"          TEXT,
  "suggestedReminder" JSONB,
  "reminderId"        TEXT,
  "status"            TEXT NOT NULL DEFAULT 'new',
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HealthInsight_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "HealthInsight_patientId_fkey" FOREIGN KEY ("patientId")
    REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HealthInsight_analysisId_fkey" FOREIGN KEY ("analysisId")
    REFERENCES "RecordAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HealthInsight_recordId_fkey" FOREIGN KEY ("recordId")
    REFERENCES "MedicalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "HealthInsight_patientId_status_idx" ON "HealthInsight"("patientId", "status");
CREATE INDEX IF NOT EXISTS "HealthInsight_analysisId_idx" ON "HealthInsight"("analysisId");

COMMIT;
