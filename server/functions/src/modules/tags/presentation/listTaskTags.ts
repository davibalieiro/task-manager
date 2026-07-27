import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { AssignTagService } from "../application/AssignTagService";
import { z } from "zod";

const ListTaskTagsSchema = z.object({
  taskId: z.string().optional(),
  tagId: z.string().optional(),
});

const service = new AssignTagService();

class ListTaskTagsHandler extends Handler<
  unknown,
  Record<string, string[]> | string[]
> {
  async handle(
    input: unknown,
    uid: string,
  ): Promise<Record<string, string[]> | string[]> {
    const parsed = ListTaskTagsSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(
        "invalid-argument",
        "Invalid input.",
        parsed.error.flatten(),
      );
    }

    if (parsed.data.taskId) {
      return service.getTagsForTask(uid, parsed.data.taskId);
    }
    if (parsed.data.tagId) {
      return service.getTasksForTag(uid, parsed.data.tagId);
    }
    return service.getAllTaskTags(uid);
  }
}

export const listTaskTags = new ListTaskTagsHandler().toFunction();
