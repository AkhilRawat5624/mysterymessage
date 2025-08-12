import {z} from 'zod'

export const acceptingMessages = z.object({
    acceptingMessages : z.boolean()
})