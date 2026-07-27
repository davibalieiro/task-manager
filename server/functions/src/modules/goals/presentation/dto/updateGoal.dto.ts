import { z } from "zod";

export const UpdateGoalSchema = z.object({
  goalId: z.string().min(1, "Goal ID é obrigatório"),
  name: z.string().trim().min(1).max(100, "Nome deve ter no máximo 100 caracteres").optional(),
  target: z.number().min(1).max(9999).optional(),
  unit: z.string().trim().min(1).max(30, "Unidade deve ter no máximo 30 caracteres").optional(),
  current: z.number().min(0).optional(),
  color: z.string().optional(),
  iconKey: z.string().optional(),
});

export type UpdateGoalDto = z.infer<typeof UpdateGoalSchema>;
