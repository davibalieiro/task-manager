import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { DeleteHabitService } from "../application/DeleteHabitService";
import { z } from "zod";

const DeleteHabitSchema = z.object({
  habitId: z.string().min(1, "Habit ID é obrigatório"),
});

const service = new DeleteHabitService();

class DeleteHabitHandler extends Handler<unknown, { message: string }> {
  async handle(input: unknown, uid: string): Promise<{ message: string }> {
    const parsed = DeleteHabitSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    await service.execute(uid, parsed.data.habitId);
    return { message: "Hábito excluído com sucesso" };
  }
}

export const deleteHabit = new DeleteHabitHandler().toFunction();
