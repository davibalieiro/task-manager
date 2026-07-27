import { z } from "zod";

export const UpdateHabitSchema = z.object({
  habitId: z.string().min(1, "Habit ID é obrigatório"),
  name: z.string().trim().min(1).max(100, "Nome deve ter no máximo 100 caracteres").optional(),
  target: z.number().min(1).max(999).optional(),
  unit: z.string().trim().min(1).max(30, "Unidade deve ter no máximo 30 caracteres").optional(),
  color: z.string().optional(),
  iconKey: z.string().optional(),
  current: z.number().min(0).optional(),
});

export type UpdateHabitDto = z.infer<typeof UpdateHabitSchema>;
