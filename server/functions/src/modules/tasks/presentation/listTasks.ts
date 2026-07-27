import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { ListTasksService } from "../application/ListTasksService";
import type { TaskResult } from "../application/ListTasksService";

const service = new ListTasksService();

class ListTasksHandler extends Handler<void, TaskResult[]> {
  async handle(_input: void, uid: string): Promise<TaskResult[]> {
    return service.execute(uid);
  }
}

export const listTasks = new ListTasksHandler().toFunction();
