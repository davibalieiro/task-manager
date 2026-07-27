import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { habitConverter } from "../../../shared/infrastructure/db/types/habit/habitConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";

export interface UpdateHabitResult {
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

export class UpdateHabitService {
  async execute(
    uid: string,
    habitId: string,
    data: { name?: string; target?: number; unit?: string; color?: string; iconKey?: string; current?: number },
  ): Promise<UpdateHabitResult> {
    logger.info("Updating habit", { uid, habitId });

    const habitDoc = await db.collection("habits").doc(habitId).withConverter(habitConverter).get();
    if (!habitDoc.exists) {
      throw new AppError("not-found", "Hábito não encontrado");
    }

    const habitData = habitDoc.data()!;
    if (habitData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    const now = Timestamp.now();
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.target !== undefined) updateData.target = data.target;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.iconKey !== undefined) updateData.iconKey = data.iconKey;
    if (data.current !== undefined) updateData.current = data.current;

    await db.collection("habits").doc(habitId).update(updateData);

    logger.info("Habit updated successfully", { habitId, uid });

    return {
      id: habitId,
      name: data.name ?? habitData.name,
      target: data.target ?? habitData.target,
      unit: data.unit ?? habitData.unit,
      color: data.color ?? habitData.color,
      iconKey: data.iconKey ?? habitData.iconKey,
      current: data.current ?? habitData.current,
      userId: uid,
      lastResetDate: habitData.lastResetDate,
      createdAt: habitData.createdAt.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }
}
