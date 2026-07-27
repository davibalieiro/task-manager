import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { taskConverter } from "../../../shared/infrastructure/db/types/task/taskConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import type { TaskStatus } from "../../../shared/infrastructure/db/types/task/task";

export interface ToggleTaskResult {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  status: TaskStatus;
  position: number;
  userId: string;
  dueDate?: string;
  projectId?: string;
  subtasks: Array<{ id: string; text: string; completed: boolean }>;
  createdAt: string;
  updatedAt: string;
}

export class ToggleTaskService {
  async execute(uid: string, taskId: string): Promise<ToggleTaskResult> {
    logger.info("Toggling task", { uid, taskId });

    const taskDoc = await db.collection("tasks").doc(taskId).withConverter(taskConverter).get();
    if (!taskDoc.exists) {
      throw new AppError("not-found", "Tarefa não encontrada");
    }

    const taskData = taskDoc.data()!;
    if (taskData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    const now = Timestamp.now();
    const newCompleted = !taskData.completed;
    const newStatus: TaskStatus = newCompleted ? "done" : "todo";

    await db.collection("tasks").doc(taskId).update({
      completed: newCompleted,
      status: newStatus,
      updatedAt: now,
    });

    logger.info("Task toggled successfully", { taskId, uid, completed: newCompleted });

    let dueDateResult: string | undefined;
    if (taskData.dueDate) {
      dueDateResult = taskData.dueDate.toDate().toISOString();
    }

    return {
      id: taskId,
      title: taskData.title,
      description: taskData.description,
      completed: newCompleted,
      status: newStatus,
      position: taskData.position,
      userId: uid,
      dueDate: dueDateResult,
      projectId: taskData.projectId,
      subtasks: taskData.subtasks || [],
      createdAt: taskData.createdAt.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }
}
