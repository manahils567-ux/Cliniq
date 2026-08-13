import { baseApi } from "./baseApi"
const NEWSLETTER_URL = '/newsletter'

export const newsletterApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        subscribeNewsletter: build.mutation({
            query: (data) => ({
                url: `${NEWSLETTER_URL}`,
                method: 'POST',
                data: data,
            }),
        })
    })
})

export const { useSubscribeNewsletterMutation } = newsletterApi
