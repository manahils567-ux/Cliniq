import { tagTypes } from '../tag-types';
import { baseApi } from './baseApi';

const REMINDER_URL = '/reminder';

export const reminderApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createReminder: build.mutation({
            query: (data) => ({
                url: `${REMINDER_URL}`,
                method: 'POST',
                data,
            }),
            invalidatesTags: [tagTypes.reminder],
        }),
        getReminders: build.query({
            query: () => ({
                url: `${REMINDER_URL}`,
                method: 'GET',
            }),
            providesTags: [tagTypes.reminder],
        }),
        updateReminder: build.mutation({
            query: ({ id, data }) => ({
                url: `${REMINDER_URL}/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: [tagTypes.reminder],
        }),
        deleteReminder: build.mutation({
            query: (id) => ({
                url: `${REMINDER_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [tagTypes.reminder],
        }),
    }),
});

export const {
    useCreateReminderMutation,
    useGetRemindersQuery,
    useUpdateReminderMutation,
    useDeleteReminderMutation,
} = reminderApi;
