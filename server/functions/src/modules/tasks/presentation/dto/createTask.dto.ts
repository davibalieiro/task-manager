import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  description: z.string().trim().max(2000, "Descrição deve ter no máximo 2000 caracteres").optional().default(""),
  projectId: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional().default("todo"),
  position: z.number().optional(),
  dueDate: z.string().optional(),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
