import type { Timestamp } from "firebase-admin/firestore";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  title: string;
  description: string;
  completed: boolean;
  status: TaskStatus;
  position: number;
  userId: string;
  projectId?: string;
  dueDate?: Timestamp;
  subtasks: Subtask[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
