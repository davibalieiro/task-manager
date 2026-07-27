import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { taskTagConverter } from "../../../shared/infrastructure/db/types/taskTag/taskTagConverter";
import { tagConverter } from "../../../shared/infrastructure/db/types/tag/tagConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";

export interface AssignTagResult {
  taskId: string;
  tagId: string;
}

export class AssignTagService {
  async assign(
    uid: string,
    taskId: string,
    tagId: string,
  ): Promise<AssignTagResult> {
    logger.info("Assigning tag to task", { uid, taskId, tagId });

    const tagDoc = await db
      .collection("tags")
      .doc(tagId)
      .withConverter(tagConverter)
      .get();

    if (!tagDoc.exists) {
      throw new AppError("not-found", "Etiqueta não encontrada");
    }

    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      throw new AppError("not-found", "Tarefa não encontrada");
    }
    const taskData = taskDoc.data();
    if (!taskData || taskData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    if (tagDoc.data()!.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    const existing = await db
      .collection("taskTags")
      .withConverter(taskTagConverter)
      .where("taskId", "==", taskId)
      .where("tagId", "==", tagId)
      .where("userId", "==", uid)
      .get();

    if (!existing.empty) {
      return { taskId, tagId };
    }

    const taskTagData = {
      taskId,
      tagId,
      userId: uid,
      createdAt: Timestamp.now(),
    };

    await db
      .collection("taskTags")
      .withConverter(taskTagConverter)
      .add(taskTagData);

    logger.info("Tag assigned successfully", { taskId, tagId, uid });
    return { taskId, tagId };
  }

  async unassign(uid: string, taskId: string, tagId: string): Promise<void> {
    logger.info("Unassigning tag from task", { uid, taskId, tagId });

    const tagDoc = await db.collection("tags").doc(tagId).withConverter(tagConverter).get();
    if (!tagDoc.exists) {
      throw new AppError("not-found", "Etiqueta não encontrada");
    }
    if (tagDoc.data()!.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      throw new AppError("not-found", "Tarefa não encontrada");
    }
    const taskData = taskDoc.data();
    if (!taskData || taskData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    const snapshot = await db
      .collection("taskTags")
      .withConverter(taskTagConverter)
      .where("taskId", "==", taskId)
      .where("tagId", "==", tagId)
      .where("userId", "==", uid)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    logger.info("Tag unassigned successfully", { taskId, tagId, uid });
  }

  async getTagsForTask(uid: string, taskId: string): Promise<string[]> {
    const snapshot = await db
      .collection("taskTags")
      .withConverter(taskTagConverter)
      .where("taskId", "==", taskId)
      .where("userId", "==", uid)
      .get();

    return snapshot.docs.map((doc) => doc.data().tagId);
  }

  async getTasksForTag(uid: string, tagId: string): Promise<string[]> {
    const snapshot = await db
      .collection("taskTags")
      .withConverter(taskTagConverter)
      .where("tagId", "==", tagId)
      .where("userId", "==", uid)
      .get();

    return snapshot.docs.map((doc) => doc.data().taskId);
  }

  async getAllTaskTags(uid: string): Promise<Record<string, string[]>> {
    const snapshot = await db
      .collection("taskTags")
      .withConverter(taskTagConverter)
      .where("userId", "==", uid)
      .get();

    const result: Record<string, string[]> = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (!result[data.taskId]) result[data.taskId] = [];
      result[data.taskId].push(data.tagId);
    });

    return result;
  }
}
