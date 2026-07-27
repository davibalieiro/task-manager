import * as logger from "firebase-functions/logger";
import { db } from "../../../shared/infrastructure/db/db";
import { goalConverter } from "../../../shared/infrastructure/db/types/goal/goalConverter";

export interface GoalResult {
  id: string;
  name: string;
  target: number;
  unit: string;
  current: number;
  color: string;
  iconKey: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class ListGoalsService {
  async execute(uid: string): Promise<GoalResult[]> {
    logger.info("Listing goals for user", { uid });

    const snapshot = await db
      .collection("goals")
      .withConverter(goalConverter)
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const goals: GoalResult[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        target: data.target,
        unit: data.unit,
        current: data.current,
        color: data.color,
        iconKey: data.iconKey,
        userId: data.userId,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      };
    });

    logger.info(`Found ${goals.length} goals`, { uid });
    return goals;
  }
}
