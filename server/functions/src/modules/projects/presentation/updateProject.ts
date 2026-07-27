import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { UpdateProjectService } from "../application/UpdateProjectService";
import { UpdateProjectSchema } from "./dto/updateProject.dto";
import type { UpdateProjectResult } from "../application/UpdateProjectService";

const service = new UpdateProjectService();

class UpdateProjectHandler extends Handler<unknown, UpdateProjectResult> {
  async handle(input: unknown, uid: string): Promise<UpdateProjectResult> {
    const parsed = UpdateProjectSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    const { projectId, ...data } = parsed.data;
    return service.execute(uid, projectId, data);
  }
}

export const updateProject = new UpdateProjectHandler().toFunction();
