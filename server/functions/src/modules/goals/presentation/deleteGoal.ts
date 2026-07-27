import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { DeleteGoalService } from "../application/DeleteGoalService";
import { z } from "zod";

const DeleteGoalSchema = z.object({
  goalId: z.string().min(1, "Goal ID é obrigatório"),
});

const service = new DeleteGoalService();

class DeleteGoalHandler extends Handler<unknown, { message: string }> {
  async handle(input: unknown, uid: string): Promise<{ message: string }> {
    const parsed = DeleteGoalSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    await service.execute(uid, parsed.data.goalId);
    return { message: "Meta excluída com sucesso" };
  }
}

export const deleteGoal = new DeleteGoalHandler().toFunction();
