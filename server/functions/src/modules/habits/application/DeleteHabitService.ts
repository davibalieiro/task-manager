import * as logger from "firebase-functions/logger";
import { db } from "../../../shared/infrastructure/db/db";
import { habitConverter } from "../../../shared/infrastructure/db/types/habit/habitConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";

export class DeleteHabitService {
  async execute(uid: string, habitId: string): Promise<void> {
    logger.info("Deleting habit", { uid, habitId });

    const habitDoc = await db.collection("habits").doc(habitId).withConverter(habitConverter).get();
    if (!habitDoc.exists) {
      throw new AppError("not-found", "Hábito não encontrado");
    }

    const habitData = habitDoc.data()!;
    if (habitData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    await db.collection("habits").doc(habitId).delete();

    logger.info("Habit deleted successfully", { habitId, uid });
  }
}
