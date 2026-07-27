import { z } from "zod";

export const CreateTagSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(50, "Nome deve ter no máximo 50 caracteres"),
  color: z.string().min(1, "Cor é obrigatória"),
});

export type CreateTagDto = z.infer<typeof CreateTagSchema>;
