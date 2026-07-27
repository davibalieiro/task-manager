import { z } from "zod";

export const AssignTagSchema = z.object({
  taskId: z.string().min(1, "Task ID é obrigatório"),
  tagId: z.string().min(1, "Tag ID é obrigatório"),
});

export type AssignTagDto = z.infer<typeof AssignTagSchema>;
