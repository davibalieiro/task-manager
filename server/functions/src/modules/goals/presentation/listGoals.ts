import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { ListGoalsService } from "../application/ListGoalsService";
import type { GoalResult } from "../application/ListGoalsService";

const service = new ListGoalsService();

class ListGoalsHandler extends Handler<undefined, GoalResult[]> {
  async handle(_input: undefined, uid: string): Promise<GoalResult[]> {
    return service.execute(uid);
  }
}

export const listGoals = new ListGoalsHandler().toFunction();
