import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { UpdateTaskService } from "../application/UpdateTaskService";
import { UpdateTaskSchema } from "./dto/updateTask.dto";
import type { UpdateTaskResult } from "../application/UpdateTaskService";

const service = new UpdateTaskService();

class UpdateTaskHandler extends Handler<unknown, UpdateTaskResult> {
  async handle(input: unknown, uid: string): Promise<UpdateTaskResult> {
    const parsed = UpdateTaskSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(uid, parsed.data.taskId, {
      title: parsed.data.title,
      description: parsed.data.description,
      completed: parsed.data.completed,
      status: parsed.data.status,
      position: parsed.data.position,
      projectId: parsed.data.projectId,
      dueDate: parsed.data.dueDate,
      subtasks: parsed.data.subtasks,
    });
  }
}

export const updateTask = new UpdateTaskHandler().toFunction();
