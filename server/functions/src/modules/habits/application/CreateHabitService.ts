import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { habitConverter } from "../../../shared/infrastructure/db/types/habit/habitConverter";

export interface CreateHabitResult {
  id: string;
  name: string;
  target: number;
  unit: string;
  color: string;
  iconKey: string;
  current: number;
  userId: string;
  lastResetDate: string;
  createdAt: string;
  updatedAt: string;
}

export class CreateHabitService {
  async execute(
    uid: string,
    name: string,
    target: number,
    unit: string,
    color: string,
    iconKey: string,
  ): Promise<CreateHabitResult> {
    logger.info("Creating habit", { uid, name });

    const now = Timestamp.now();
    const habitData = {
      name,
      target,
      unit,
      color,
      iconKey,
      current: 0,
      userId: uid,
      lastResetDate: new Date().toDateString(),
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("habits").withConverter(habitConverter).add(habitData);

    logger.info("Habit created successfully", { habitId: docRef.id, uid });

    return {
      id: docRef.id,
      name,
      target,
      unit,
      color,
      iconKey,
      current: 0,
      userId: uid,
      lastResetDate: new Date().toDateString(),
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }
}
