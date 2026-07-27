import * as logger from "firebase-functions/logger";
import { db } from "../../../shared/infrastructure/db/db";
import { taskConverter } from "../../../shared/infrastructure/db/types/task/taskConverter";
import type { TaskStatus, Subtask } from "../../../shared/infrastructure/db/types/task/task";

export interface TaskResult {
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

export class ListTasksService {
  async execute(uid: string): Promise<TaskResult[]> {
    logger.info("Listing tasks for user", { uid });

    const snapshot = await db
      .collection("tasks")
      .withConverter(taskConverter)
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const tasks: TaskResult[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        completed: data.completed,
        status: data.status || "todo",
        position: data.position ?? 0,
        userId: data.userId,
        projectId: data.projectId,
        dueDate: data.dueDate?.toDate().toISOString(),
        subtasks: data.subtasks || [],
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      };
    });

    logger.info(`Found ${tasks.length} tasks`, { uid });
    return tasks;
  }
}
