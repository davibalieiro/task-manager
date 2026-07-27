import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { DeleteTaskService } from "../application/DeleteTaskService";
import { z } from "zod";

const DeleteTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID é obrigatório"),
});

const service = new DeleteTaskService();

class DeleteTaskHandler extends Handler<unknown, { message: string }> {
  async handle(input: unknown, uid: string): Promise<{ message: string }> {
    const parsed = DeleteTaskSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    await service.execute(uid, parsed.data.taskId);
    return { message: "Tarefa excluída com sucesso" };
  }
}

export const deleteTask = new DeleteTaskHandler().toFunction();
