import { z } from "zod";

export const DeleteProjectSchema = z.object({
  projectId: z.string().min(1, "ID do projeto é obrigatório"),
});

export type DeleteProjectDto = z.infer<typeof DeleteProjectSchema>;
