import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { UpdateHabitService } from "../application/UpdateHabitService";
import { UpdateHabitSchema } from "./dto/updateHabit.dto";
import type { UpdateHabitResult } from "../application/UpdateHabitService";

const service = new UpdateHabitService();

class UpdateHabitHandler extends Handler<unknown, UpdateHabitResult> {
  async handle(input: unknown, uid: string): Promise<UpdateHabitResult> {
    const parsed = UpdateHabitSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError("invalid-argument", "Invalid input.", parsed.error.flatten());
    }

    return service.execute(uid, parsed.data.habitId, {
      name: parsed.data.name,
      target: parsed.data.target,
      unit: parsed.data.unit,
      color: parsed.data.color,
      iconKey: parsed.data.iconKey,
      current: parsed.data.current,
    });
  }
}

export const updateHabit = new UpdateHabitHandler().toFunction();
