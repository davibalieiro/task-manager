import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100),
  description: z.string().trim().max(500).optional(),
  color: z.string().optional(),
})

export type CreateProjectFormData = z.infer<typeof createProjectSchema>

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100).optional(),
  description: z.string().trim().max(500).optional(),
  color: z.string().optional(),
})

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>
