import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { goalConverter } from "../../../shared/infrastructure/db/types/goal/goalConverter";

export interface CreateGoalResult {
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

export class CreateGoalService {
  async execute(
    uid: string,
    name: string,
    target: number,
    unit: string,
    color: string,
    iconKey: string,
  ): Promise<CreateGoalResult> {
    logger.info("Creating goal", { uid, name });

    const now = Timestamp.now();
    const goalData = {
      name,
      target,
      unit,
      current: 0,
      color,
      iconKey,
      userId: uid,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("goals").withConverter(goalConverter).add(goalData);

    logger.info("Goal created successfully", { goalId: docRef.id, uid });

    return {
      id: docRef.id,
      name,
      target,
      unit,
      current: 0,
      color,
      iconKey,
      userId: uid,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }
}
