import type { Timestamp } from "firebase-admin/firestore";

export type ProjectStatus = "pending" | "in_progress" | "completed";

export interface Project {
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
