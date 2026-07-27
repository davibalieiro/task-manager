import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { ListProjectsService } from "../application/ListProjectsService";
import type { ProjectResult } from "../application/ListProjectsService";

const service = new ListProjectsService();

class ListProjectsHandler extends Handler<unknown, ProjectResult[]> {
  async handle(_input: unknown, uid: string): Promise<ProjectResult[]> {
    return service.execute(uid);
  }
}

export const listProjects = new ListProjectsHandler().toFunction();
