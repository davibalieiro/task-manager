import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { UpdateTagService } from "../application/UpdateTagService";
import { UpdateTagSchema } from "./dto/updateTag.dto";
import type { UpdateTagResult } from "../application/UpdateTagService";

const service = new UpdateTagService();

class UpdateTagHandler extends Handler<unknown, UpdateTagResult> {
  async handle(input: unknown, uid: string): Promise<UpdateTagResult> {
    const parsed = UpdateTagSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(
        "invalid-argument",
        "Invalid input.",
        parsed.error.flatten(),
      );
    }

    return service.execute(uid, parsed.data.tagId, {
      name: parsed.data.name,
      color: parsed.data.color,
    });
  }
}

export const updateTag = new UpdateTagHandler().toFunction();
