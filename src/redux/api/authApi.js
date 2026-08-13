import { setUserInfo } from "../../utils/local-storage";
import { baseApi } from "./baseApi"

const AUTH_URL = '/auth'

export const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        userLogin: build.mutation({
            query: (loginData) => ({
                url: `${AUTH_URL}/login`,
                method: 'POST',
                data: loginData,
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = (await queryFulfilled).data;
                    setUserInfo({ accessToken: result.accessToken });
                } catch (error) {
                }
            },
        }),
        patientSignUp: build.mutation({
            query: (data) => ({
                url: `/patient`,
                method: 'POST',
                data,
            }),
        }),
        doctorSignUp: build.mutation({
            query: (data) => ({
                url: `/doctor`,
                method: 'POST',
                data,
            }),
        }),
        resetPassword: build.mutation({
            query: (data) => ({
                url: `${AUTH_URL}/reset-password`,
                method: 'POST',
                data,
            }),
        }),
        resetConfirm: build.mutation({
            query: (data) => ({
                url: `${AUTH_URL}/reset-password/confirm`,
                method: 'POST',
                data,
            }),
        }),
        googleLogin: build.mutation({
            query: (data) => ({
                url: `${AUTH_URL}/google`,
                method: 'POST',
                data,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const result = (await queryFulfilled).data;
                    const accessToken = result?.accessToken || result?.data?.accessToken;
                    if (accessToken) setUserInfo({ accessToken });
                } catch {}
            },
        }),
        changePassword: build.mutation({
            query: (data) => ({
                url: `${AUTH_URL}/change-password`,
                method: 'PATCH',
                data,
            }),
        }),
    })
})

export const { 
    useUserLoginMutation, 
    useDoctorSignUpMutation, 
    usePatientSignUpMutation,
    useResetPasswordMutation, 
    useResetConfirmMutation,
    useGoogleLoginMutation,
    useChangePasswordMutation
} = authApi