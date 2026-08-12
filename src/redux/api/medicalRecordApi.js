import { tagTypes } from '../tag-types';
import { baseApi } from './baseApi';

const MEDICAL_RECORD_URL = '/medical-record';

export const medicalRecordApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        uploadMedicalRecord: build.mutation({
            query: (formData) => ({
                url: `${MEDICAL_RECORD_URL}/upload`,
                method: 'POST',
                data: formData,
                // axios will set multipart/form-data automatically for FormData
            }),
            invalidatesTags: [tagTypes.medicalRecord],
        }),
        getMedicalRecords: build.query({
            query: () => ({
                url: `${MEDICAL_RECORD_URL}`,
                method: 'GET',
            }),
            providesTags: [tagTypes.medicalRecord],
        }),
        getMedicalRecord: build.query({
            query: (id) => ({
                url: `${MEDICAL_RECORD_URL}/${id}`,
                method: 'GET',
            }),
            providesTags: [tagTypes.medicalRecord],
        }),
        deleteMedicalRecord: build.mutation({
            query: (id) => ({
                url: `${MEDICAL_RECORD_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [tagTypes.medicalRecord],
        }),
        generateMedicalHistory: build.mutation({
            query: () => ({
                url: `/ai/medical-history`,
                method: 'POST',
            }),
        }),
        shareMedicalRecords: build.mutation({
            query: (data) => ({
                url: `${MEDICAL_RECORD_URL}/share`,
                method: 'POST',
                data,
            }),
            invalidatesTags: [tagTypes.medicalRecord],
        }),
        getSharedRecordsForAppointment: build.query({
            query: (appointmentId) => ({
                url: `${MEDICAL_RECORD_URL}/shared/appointment/${appointmentId}`,
                method: 'GET',
            }),
            providesTags: [tagTypes.medicalRecord],
        }),

        // ── AI document analysis ──────────────────────────────────────────
        getRecordAnalysis: build.query({
            query: (id) => ({
                url: `${MEDICAL_RECORD_URL}/${id}/analysis`,
                method: 'GET',
            }),
            providesTags: [tagTypes.medicalRecord],
        }),
        reanalyzeRecord: build.mutation({
            query: (id) => ({
                url: `${MEDICAL_RECORD_URL}/${id}/analyze`,
                method: 'POST',
            }),
            invalidatesTags: [tagTypes.medicalRecord, tagTypes.healthInsight],
        }),
        getHealthInsights: build.query({
            query: (status) => ({
                url: `${MEDICAL_RECORD_URL}/insights`,
                method: 'GET',
                params: status ? { status } : undefined,
            }),
            providesTags: [tagTypes.healthInsight],
        }),
        getInsightSummary: build.query({
            query: () => ({
                url: `${MEDICAL_RECORD_URL}/insights/summary`,
                method: 'GET',
            }),
            providesTags: [tagTypes.healthInsight],
        }),
        updateInsight: build.mutation({
            query: ({ id, status }) => ({
                url: `${MEDICAL_RECORD_URL}/insights/${id}`,
                method: 'PATCH',
                data: { status },
            }),
            invalidatesTags: [tagTypes.healthInsight],
        }),
        acceptInsightReminder: build.mutation({
            query: (id) => ({
                url: `${MEDICAL_RECORD_URL}/insights/${id}/accept-reminder`,
                method: 'POST',
            }),
            invalidatesTags: [tagTypes.healthInsight, tagTypes.reminder],
        }),
        getMetricTrends: build.query({
            query: (key) => ({
                url: `${MEDICAL_RECORD_URL}/trends`,
                method: 'GET',
                params: key ? { key } : undefined,
            }),
            providesTags: [tagTypes.healthInsight],
        }),
    }),
});

export const {
    useUploadMedicalRecordMutation,
    useGetMedicalRecordsQuery,
    useGetMedicalRecordQuery,
    useDeleteMedicalRecordMutation,
    useGenerateMedicalHistoryMutation,
    useShareMedicalRecordsMutation,
    useGetSharedRecordsForAppointmentQuery,
    useGetRecordAnalysisQuery,
    useReanalyzeRecordMutation,
    useGetHealthInsightsQuery,
    useGetInsightSummaryQuery,
    useUpdateInsightMutation,
    useAcceptInsightReminderMutation,
    useGetMetricTrendsQuery,
} = medicalRecordApi;
