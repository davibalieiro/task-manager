import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { ToggleTaskService } from "../application/ToggleTaskService";
import { z } from "zod";
import type { ToggleTaskResult } from "../application/ToggleTaskService";

const ToggleTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID é obrigatório"),
});

const service = new ToggleTaskService();

class ToggleTaskHandler extends Handler<unknown, ToggleTaskResult> {
  async handle(input: unknown, uid: string): Promise<ToggleTaskResult> {
    const parsed = ToggleTaskSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(uid, parsed.data.taskId);
  }
}

export const toggleTask = new ToggleTaskHandler().toFunction();
