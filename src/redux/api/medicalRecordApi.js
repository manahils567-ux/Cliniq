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
    }),
});

export const {
    useUploadMedicalRecordMutation,
    useGetMedicalRecordsQuery,
    useGetMedicalRecordQuery,
    useDeleteMedicalRecordMutation,
} = medicalRecordApi;
