import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { ListTagsService } from "../application/ListTagsService";
import type { TagResult } from "../application/ListTagsService";

const service = new ListTagsService();

class ListTagsHandler extends Handler<undefined, TagResult[]> {
  async handle(_input: undefined, uid: string): Promise<TagResult[]> {
    return service.execute(uid);
  }
}

export const listTags = new ListTagsHandler().toFunction();
