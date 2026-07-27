import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { CreateTaskService } from "../application/CreateTaskService";
import { CreateTaskSchema } from "./dto/createTask.dto";
import type { CreateTaskResult } from "../application/CreateTaskService";

const service = new CreateTaskService();

class CreateTaskHandler extends Handler<unknown, CreateTaskResult> {
  async handle(input: unknown, uid: string): Promise<CreateTaskResult> {
    const parsed = CreateTaskSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(uid, parsed.data.title, parsed.data.description, parsed.data.projectId, parsed.data.status, parsed.data.position, parsed.data.dueDate);
  }
}

export const createTask = new CreateTaskHandler().toFunction();
