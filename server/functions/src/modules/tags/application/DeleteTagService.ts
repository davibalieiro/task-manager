import * as logger from "firebase-functions/logger";
import { db } from "../../../shared/infrastructure/db/db";
import { tagConverter } from "../../../shared/infrastructure/db/types/tag/tagConverter";
import { taskTagConverter } from "../../../shared/infrastructure/db/types/taskTag/taskTagConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";

export class DeleteTagService {
  async execute(uid: string, tagId: string): Promise<void> {
    logger.info("Deleting tag", { uid, tagId });

    const tagDoc = await db
      .collection("tags")
      .doc(tagId)
      .withConverter(tagConverter)
      .get();

    if (!tagDoc.exists) {
      throw new AppError("not-found", "Etiqueta não encontrada");
    }

    const tagData = tagDoc.data()!;
    if (tagData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    const taskTagsSnapshot = await db
      .collection("taskTags")
      .withConverter(taskTagConverter)
      .where("tagId", "==", tagId)
      .where("userId", "==", uid)
      .get();

    const batch = db.batch();
    taskTagsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    batch.delete(db.collection("tags").doc(tagId));
    await batch.commit();

    logger.info("Tag deleted successfully", { tagId, uid });
  }
}
