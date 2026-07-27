import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { UpdateGoalService } from "../application/UpdateGoalService";
import { UpdateGoalSchema } from "./dto/updateGoal.dto";
import type { UpdateGoalResult } from "../application/UpdateGoalService";

const service = new UpdateGoalService();

class UpdateGoalHandler extends Handler<unknown, UpdateGoalResult> {
  async handle(input: unknown, uid: string): Promise<UpdateGoalResult> {
    const parsed = UpdateGoalSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(uid, parsed.data.goalId, {
      name: parsed.data.name,
      target: parsed.data.target,
      unit: parsed.data.unit,
      current: parsed.data.current,
      color: parsed.data.color,
      iconKey: parsed.data.iconKey,
    });
  }
}

export const updateGoal = new UpdateGoalHandler().toFunction();
