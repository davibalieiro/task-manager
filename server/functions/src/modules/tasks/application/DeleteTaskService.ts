import * as logger from "firebase-functions/logger";
import { db } from "../../../shared/infrastructure/db/db";
import { taskConverter } from "../../../shared/infrastructure/db/types/task/taskConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";

export class DeleteTaskService {
  async execute(uid: string, taskId: string): Promise<void> {
    logger.info("Deleting task", { uid, taskId });

    const taskDoc = await db.collection("tasks").doc(taskId).withConverter(taskConverter).get();
    if (!taskDoc.exists) {
      throw new AppError("not-found", "Tarefa não encontrada");
    }

    const taskData = taskDoc.data()!;
    if (taskData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    const taskTagsSnapshot = await db.collection("taskTags").where("taskId", "==", taskId).where("userId", "==", uid).get();
    const batch = db.batch();
    taskTagsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    await db.collection("tasks").doc(taskId).delete();

    logger.info("Task deleted successfully", { taskId, uid });
  }
}
