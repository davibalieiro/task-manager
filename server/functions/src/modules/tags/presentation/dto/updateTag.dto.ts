import { z } from "zod";

export const UpdateTagSchema = z.object({
  tagId: z.string().min(1, "Tag ID é obrigatório"),
  name: z.string().trim().min(1).max(50, "Nome deve ter no máximo 50 caracteres").optional(),
  color: z.string().optional(),
});

export type UpdateTagDto = z.infer<typeof UpdateTagSchema>;
