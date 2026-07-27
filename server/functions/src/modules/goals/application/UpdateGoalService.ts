import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { goalConverter } from "../../../shared/infrastructure/db/types/goal/goalConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";

export interface UpdateGoalResult {
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

export class UpdateGoalService {
  async execute(
    uid: string,
    goalId: string,
    data: { name?: string; target?: number; unit?: string; current?: number; color?: string; iconKey?: string },
  ): Promise<UpdateGoalResult> {
    logger.info("Updating goal", { uid, goalId });

    const goalDoc = await db.collection("goals").doc(goalId).withConverter(goalConverter).get();
    if (!goalDoc.exists) {
      throw new AppError("not-found", "Meta não encontrada");
    }

    const goalData = goalDoc.data()!;
    if (goalData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    const now = Timestamp.now();
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.target !== undefined) updateData.target = data.target;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.current !== undefined) updateData.current = data.current;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.iconKey !== undefined) updateData.iconKey = data.iconKey;

    await db.collection("goals").doc(goalId).update(updateData);

    logger.info("Goal updated successfully", { goalId, uid });

    return {
      id: goalId,
      name: data.name ?? goalData.name,
      target: data.target ?? goalData.target,
      unit: data.unit ?? goalData.unit,
      current: data.current ?? goalData.current,
      color: data.color ?? goalData.color,
      iconKey: data.iconKey ?? goalData.iconKey,
      userId: uid,
      createdAt: goalData.createdAt.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }
}
