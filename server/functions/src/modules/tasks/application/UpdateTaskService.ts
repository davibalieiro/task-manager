import * as logger from "firebase-functions/logger";

import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { taskConverter } from "../../../shared/infrastructure/db/types/task/taskConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import type { TaskStatus, Subtask } from "../../../shared/infrastructure/db/types/task/task";

export interface UpdateTaskResult {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  status: TaskStatus;
  position: number;
  userId: string;
  projectId?: string;
  dueDate?: string;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export class UpdateTaskService {
  async execute(
    uid: string,
    taskId: string,
    data: { title?: string; description?: string; completed?: boolean; status?: TaskStatus; position?: number; projectId?: string | null; dueDate?: string | null; subtasks?: Subtask[] },
  ): Promise<UpdateTaskResult> {
    logger.info("Updating task", { uid, taskId });

    const taskDoc = await db.collection("tasks").doc(taskId).withConverter(taskConverter).get();
    if (!taskDoc.exists) {
      throw new AppError("not-found", "Tarefa não encontrada");
    }

    const taskData = taskDoc.data()!;
    if (taskData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    const now = Timestamp.now();
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "done") updateData.completed = true;
      else if (data.status === "todo" || data.status === "in_progress") updateData.completed = false;
    }
    if (data.position !== undefined) updateData.position = data.position;
    if (data.projectId !== undefined) {
      updateData.projectId = data.projectId === null ? null : data.projectId;
    }
    if (data.subtasks !== undefined) updateData.subtasks = data.subtasks;
    if (data.dueDate !== undefined) {
      if (data.dueDate === null) {
        updateData.dueDate = null;
      } else if (data.dueDate) {
        updateData.dueDate = Timestamp.fromDate(new Date(data.dueDate));
      }
    }

    await db.collection("tasks").doc(taskId).update(updateData);

    logger.info("Task updated successfully", { taskId, uid });

    const newStatus = data.status ?? taskData.status;
    let dueDateResult: string | undefined;
    if (data.dueDate !== undefined) {
      if (data.dueDate === null) {
        dueDateResult = undefined;
      } else if (data.dueDate) {
        dueDateResult = new Date(data.dueDate).toISOString();
      }
    } else if (taskData.dueDate) {
      dueDateResult = taskData.dueDate.toDate().toISOString();
    }

    return {
      id: taskId,
      title: data.title ?? taskData.title,
      description: data.description ?? taskData.description,
      completed: data.completed ?? taskData.completed,
      status: newStatus,
      position: data.position ?? taskData.position,
      userId: uid,
      projectId: data.projectId !== undefined ? (data.projectId === null ? undefined : data.projectId) : taskData.projectId,
      dueDate: dueDateResult,
      subtasks: data.subtasks ?? taskData.subtasks ?? [],
      createdAt: taskData.createdAt.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }
}