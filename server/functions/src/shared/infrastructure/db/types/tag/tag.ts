import type { Timestamp } from "firebase-admin/firestore";

export interface Tag {
  name: string;
  color: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
