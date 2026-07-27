import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { AssignTagService } from "../application/AssignTagService";
import { AssignTagSchema } from "./dto/assignTag.dto";
import type { AssignTagResult } from "../application/AssignTagService";

const service = new AssignTagService();

class AssignTagHandler extends Handler<unknown, AssignTagResult> {
  async handle(input: unknown, uid: string): Promise<AssignTagResult> {
    const parsed = AssignTagSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(
        "invalid-argument",
        "Invalid input.",
        parsed.error.flatten(),
      );
    }

    return service.assign(uid, parsed.data.taskId, parsed.data.tagId);
  }
}

export const assignTag = new AssignTagHandler().toFunction();
