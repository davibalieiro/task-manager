import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { ListTasksService } from "../application/ListTasksService";
import type { TaskResult } from "../application/ListTasksService";

const service = new ListTasksService();

class ListTasksHandler extends Handler<undefined, TaskResult[]> {
  async handle(_input: undefined, uid: string): Promise<TaskResult[]> {
    return service.execute(uid);
  }
}

export const listTasks = new ListTasksHandler().toFunction();
