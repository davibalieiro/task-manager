import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres").optional().default(""),
  color: z.string().optional().default("#6366f1"),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
