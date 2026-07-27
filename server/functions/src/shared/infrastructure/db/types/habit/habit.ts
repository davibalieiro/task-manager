import type { Timestamp } from "firebase-admin/firestore";

export interface Habit {
  name: string;
  target: number;
  unit: string;
  color: string;
  iconKey: string;
  current: number;
  userId: string;
  lastResetDate: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
