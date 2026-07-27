import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { CreateProjectService } from "../application/CreateProjectService";
import { CreateProjectSchema } from "./dto/createProject.dto";
import type { CreateProjectResult } from "../application/CreateProjectService";

const service = new CreateProjectService();

class CreateProjectHandler extends Handler<unknown, CreateProjectResult> {
  async handle(input: unknown, uid: string): Promise<CreateProjectResult> {
    const parsed = CreateProjectSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(uid, parsed.data.name, parsed.data.description, parsed.data.color);
  }
}

export const createProject = new CreateProjectHandler().toFunction();
