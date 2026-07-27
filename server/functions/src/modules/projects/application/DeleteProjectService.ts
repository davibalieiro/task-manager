import * as logger from "firebase-functions/logger";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { db } from "../../../shared/infrastructure/db/db";
import { projectConverter } from "../../../shared/infrastructure/db/types/project/projectConverter";

export class DeleteProjectService {
  async execute(uid: string, projectId: string): Promise<void> {
    logger.info("Deleting project", { uid, projectId });

    const docRef = db
      .collection("projects")
      .withConverter(projectConverter)
      .doc(projectId);

    const doc = await docRef.get();

    if (!doc.exists) {
      throw new AppError("not-found", "Projeto não encontrado");
    }

    if (doc.data()!.userId !== uid) {
      throw new AppError("permission-denied", "Sem permissão para excluir este projeto");
    }

    const tasksSnapshot = await db
      .collection("tasks")
      .where("userId", "==", uid)
      .where("projectId", "==", projectId)
      .get();

    const batch = db.batch();
    const BATCH_LIMIT = 500;
    let opCount = 0;
    tasksSnapshot.docs.forEach((taskDoc) => {
      if (opCount >= BATCH_LIMIT) return;
      batch.update(taskDoc.ref, { projectId: null });
      opCount++;
    });
    await batch.commit();

    await docRef.delete();

    logger.info("Project deleted successfully", { projectId, uid, tasksUpdated: tasksSnapshot.size });
  }
}
