import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { AssignTagService } from "../application/AssignTagService";
import { AssignTagSchema } from "./dto/assignTag.dto";

const service = new AssignTagService();

class UnassignTagHandler extends Handler<unknown, { message: string }> {
  async handle(
    input: unknown,
    uid: string,
  ): Promise<{ message: string }> {
    const parsed = AssignTagSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(
        "invalid-argument",
        "Invalid input.",
        parsed.error.flatten(),
      );
    }

    await service.unassign(uid, parsed.data.taskId, parsed.data.tagId);
    return { message: "Etiqueta removida com sucesso" };
  }
}

export const unassignTag = new UnassignTagHandler().toFunction();
