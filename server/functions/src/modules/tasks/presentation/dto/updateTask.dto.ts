import { z } from "zod";

const SubtaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
});

export const UpdateTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID é obrigatório"),
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres").optional(),
  description: z.string().trim().max(2000, "Descrição deve ter no máximo 2000 caracteres").optional(),
  completed: z.boolean().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  position: z.number().optional(),
  projectId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  subtasks: z.array(SubtaskSchema).optional(),
});

export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
