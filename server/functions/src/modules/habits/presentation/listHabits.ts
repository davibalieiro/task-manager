import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { ListHabitsService } from "../application/ListHabitsService";
import type { HabitResult } from "../application/ListHabitsService";

const service = new ListHabitsService();

class ListHabitsHandler extends Handler<void, HabitResult[]> {
  async handle(_input: void, uid: string): Promise<HabitResult[]> {
    return service.execute(uid);
  }
}

export const listHabits = new ListHabitsHandler().toFunction();
