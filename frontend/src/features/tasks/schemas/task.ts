import { z } from 'zod'

export const taskFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100),
  description: z.string().max(500).optional(),
})

export type TaskFormData = z.infer<typeof taskFormSchema>
