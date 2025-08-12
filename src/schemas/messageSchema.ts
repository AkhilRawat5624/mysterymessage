import { z } from 'zod'

export const messageSchema = z.object({
    content: z.string().min(10, { error: 'content must be atleast 10 charxcters' }).max(300, { error: 'content must be atleast 300 charxcters' })
})