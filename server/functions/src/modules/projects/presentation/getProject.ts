import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { GetProjectService } from "../application/GetProjectService";
import { z } from "zod";
import type { ProjectResult } from "../application/GetProjectService";

const GetProjectSchema = z.object({
  projectId: z.string().min(1, "ID do projeto é obrigatório"),
});

const service = new GetProjectService();

class GetProjectHandler extends Handler<unknown, ProjectResult> {
  async handle(input: unknown, uid: string): Promise<ProjectResult> {
    const parsed = GetProjectSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(uid, parsed.data.projectId);
  }
}

export const getProject = new GetProjectHandler().toFunction();
