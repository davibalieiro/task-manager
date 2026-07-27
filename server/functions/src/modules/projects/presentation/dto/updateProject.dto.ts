import { z } from "zod";

export const UpdateProjectSchema = z.object({
  projectId: z.string().min(1, "ID do projeto é obrigatório"),
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres").optional(),
  description: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  color: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
