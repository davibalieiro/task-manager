import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { taskConverter } from "../../../shared/infrastructure/db/types/task/taskConverter";
import type { TaskStatus, Subtask } from "../../../shared/infrastructure/db/types/task/task";

export interface CreateTaskResult {
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

export class CreateTaskService {
  async execute(
    uid: string,
    title: string,
    description: string,
    projectId?: string,
    status: TaskStatus = "todo",
    position?: number,
    dueDate?: string,
  ): Promise<CreateTaskResult> {
    logger.info("Creating task", { uid, title });

    const now = Timestamp.now();

    const positionValue = position ?? Date.now();

    const dueDateTimestamp = dueDate ? Timestamp.fromDate(new Date(dueDate)) : undefined;

    const taskData = {
      title,
      description,
      completed: status === "done",
      status,
      position: positionValue,
      userId: uid,
      ...(projectId ? { projectId } : {}),
      ...(dueDateTimestamp ? { dueDate: dueDateTimestamp } : {}),
      subtasks: [] as Subtask[],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("tasks").withConverter(taskConverter).add(taskData);

    logger.info("Task created successfully", { taskId: docRef.id, uid });

    return {
      id: docRef.id,
      title,
      description,
      completed: status === "done",
      status,
      position: positionValue,
      userId: uid,
      projectId,
      dueDate: dueDateTimestamp?.toDate().toISOString(),
      subtasks: [],
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }
}
