import type { Timestamp } from "firebase-admin/firestore";

export interface Goal {
  name: string;
  target: number;
  unit: string;
  current: number;
  color: string;
  iconKey: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
