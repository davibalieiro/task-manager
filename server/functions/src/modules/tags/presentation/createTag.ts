import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { CreateTagService } from "../application/CreateTagService";
import { CreateTagSchema } from "./dto/createTag.dto";
import type { CreateTagResult } from "../application/CreateTagService";

const service = new CreateTagService();

class CreateTagHandler extends Handler<unknown, CreateTagResult> {
  async handle(input: unknown, uid: string): Promise<CreateTagResult> {
    const parsed = CreateTagSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(
        "invalid-argument",
        "Invalid input.",
        parsed.error.flatten(),
      );
    }

    return service.execute(uid, parsed.data.name, parsed.data.color);
  }
}

export const createTag = new CreateTagHandler().toFunction();
