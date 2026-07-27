import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { CreateGoalService } from "../application/CreateGoalService";
import { CreateGoalSchema } from "./dto/createGoal.dto";
import type { CreateGoalResult } from "../application/CreateGoalService";

const service = new CreateGoalService();

class CreateGoalHandler extends Handler<unknown, CreateGoalResult> {
  async handle(input: unknown, uid: string): Promise<CreateGoalResult> {
    const parsed = CreateGoalSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(uid, parsed.data.name, parsed.data.target, parsed.data.unit, parsed.data.color, parsed.data.iconKey);
  }
}

export const createGoal = new CreateGoalHandler().toFunction();
