import { tagTypes } from "../tag-types"
import { baseApi } from "./baseApi"

const DOC_URL = '/doctor'

export const doctorApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getSpecialities: build.query({
            query: () => ({
                url: `${DOC_URL}/specialities`,
                method: 'GET',
            }),
            transformResponse: (response) => (Array.isArray(response) ? response : response?.data ?? []),
            providesTags: [tagTypes.doctor],
        }),
        getPlatformStats: build.query({
            query: () => ({
                url: `${DOC_URL}/stats`,
                method: 'GET',
            }),
            // The axios interceptor already unwraps the envelope, so RTK hands
            // us the payload itself. Tolerate both shapes rather than guessing.
            transformResponse: (response) =>
                (response && typeof response === 'object' && 'doctors' in response)
                    ? response
                    : (response?.data ?? response ?? {}),
            providesTags: [tagTypes.doctor],
        }),
        getDoctors: build.query({
            query: (arg) => ({
                url: `${DOC_URL}`,
                method: 'GET',
                params: arg
            }),
            transformResponse: (response) => {
                return {
                    doctors: response?.data || [],
                    meta: response?.meta || {}
                };
            },
            providesTags: [tagTypes.doctor]
        }),
        getDoctor: build.query({
            query: (id) => ({
                url: `${DOC_URL}/${id}`,
                method: 'GET',
            }),
            providesTags: [tagTypes.doctor]
        }),
        updateDoctor: build.mutation({
            query: ({ data, id }) => ({
                url: `${DOC_URL}/${id}`,
                method: 'PATCH',
                data: data,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }),
            invalidatesTags: [tagTypes.doctor]
        })
    })
})

export const {
    useGetDoctorsQuery,
    useGetDoctorQuery,
    useUpdateDoctorMutation,
    useGetPlatformStatsQuery,
    useGetSpecialitiesQuery,
} = doctorApi