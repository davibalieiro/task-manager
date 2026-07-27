import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { DeleteProjectService } from "../application/DeleteProjectService";
import { DeleteProjectSchema } from "./dto/deleteProject.dto";

const service = new DeleteProjectService();

class DeleteProjectHandler extends Handler<unknown, void> {
  async handle(input: unknown, uid: string): Promise<void> {
    const parsed = DeleteProjectSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(uid, parsed.data.projectId);
  }
}

export const deleteProject = new DeleteProjectHandler().toFunction();
