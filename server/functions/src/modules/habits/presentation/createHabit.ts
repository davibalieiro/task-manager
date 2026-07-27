import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { CreateHabitService } from "../application/CreateHabitService";
import { CreateHabitSchema } from "./dto/createHabit.dto";
import type { CreateHabitResult } from "../application/CreateHabitService";

const service = new CreateHabitService();

class CreateHabitHandler extends Handler<unknown, CreateHabitResult> {
  async handle(input: unknown, uid: string): Promise<CreateHabitResult> {
    const parsed = CreateHabitSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(uid, parsed.data.name, parsed.data.target, parsed.data.unit, parsed.data.color, parsed.data.iconKey);
  }
}

export const createHabit = new CreateHabitHandler().toFunction();
