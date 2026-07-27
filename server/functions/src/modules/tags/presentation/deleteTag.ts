import { Handler } from "../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { DeleteTagService } from "../application/DeleteTagService";
import { z } from "zod";

const DeleteTagSchema = z.object({
  tagId: z.string().min(1, "Tag ID é obrigatório"),
});

const service = new DeleteTagService();

class DeleteTagHandler extends Handler<unknown, { message: string }> {
  async handle(
    input: unknown,
    uid: string,
  ): Promise<{ message: string }> {
    const parsed = DeleteTagSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(
        "invalid-argument",
        "Invalid input.",
        parsed.error.flatten(),
      );
    }

    await service.execute(uid, parsed.data.tagId);
    return { message: "Etiqueta excluída com sucesso" };
  }
}

export const deleteTag = new DeleteTagHandler().toFunction();
