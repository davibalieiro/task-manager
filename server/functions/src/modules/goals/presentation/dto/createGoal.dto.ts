import { z } from "zod";

export const CreateGoalSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  target: z.number().min(1, "Alvo deve ser maior que 0").max(9999),
  unit: z.string().trim().min(1, "Unidade é obrigatória").max(30, "Unidade deve ter no máximo 30 caracteres"),
  color: z.string().min(1, "Cor é obrigatória"),
  iconKey: z.string().min(1, "Ícone é obrigatório"),
});

export type CreateGoalDto = z.infer<typeof CreateGoalSchema>;
