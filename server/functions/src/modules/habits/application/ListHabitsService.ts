import * as logger from "firebase-functions/logger";
import { db } from "../../../shared/infrastructure/db/db";
import { habitConverter } from "../../../shared/infrastructure/db/types/habit/habitConverter";

export interface HabitResult {
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

export class ListHabitsService {
  async execute(uid: string): Promise<HabitResult[]> {
    logger.info("Listing habits for user", { uid });

    const snapshot = await db
      .collection("habits")
      .withConverter(habitConverter)
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const habits: HabitResult[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        target: data.target,
        unit: data.unit,
        color: data.color,
        iconKey: data.iconKey,
        current: data.current,
        userId: data.userId,
        lastResetDate: data.lastResetDate,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      };
    });

    logger.info(`Found ${habits.length} habits`, { uid });
    return habits;
  }
}
