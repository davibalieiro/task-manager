import * as logger from "firebase-functions/logger";
import { db } from "../../../shared/infrastructure/db/db";
import { goalConverter } from "../../../shared/infrastructure/db/types/goal/goalConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";

export class DeleteGoalService {
  async execute(uid: string, goalId: string): Promise<void> {
    logger.info("Deleting goal", { uid, goalId });

    const goalDoc = await db.collection("goals").doc(goalId).withConverter(goalConverter).get();
    if (!goalDoc.exists) {
      throw new AppError("not-found", "Meta não encontrada");
    }

    const goalData = goalDoc.data()!;
    if (goalData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    await db.collection("goals").doc(goalId).delete();

    logger.info("Goal deleted successfully", { goalId, uid });
  }
}
