import type { Timestamp } from "firebase-admin/firestore";

export interface TaskTag {
  taskId: string;
  tagId: string;
  userId: string;
  createdAt: Timestamp;
}
