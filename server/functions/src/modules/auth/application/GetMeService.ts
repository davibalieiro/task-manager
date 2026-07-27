import * as logger from "firebase-functions/logger";
import { auth } from "../../../shared/infrastructure/config/firebase";
import { db } from "../../../shared/infrastructure/db/db";
import { userConverter } from "../../../shared/infrastructure/db/types/user/userConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";

export interface MeResult {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export class GetMeService {
  async execute(uid: string): Promise<MeResult> {
    logger.info("Fetching user profile", { uid });

    const [userDoc, userRecord] = await Promise.all([
      db.collection("users").doc(uid).withConverter(userConverter).get(),
      auth.getUser(uid),
    ]);
    const userData = userDoc.data();

    if (!userData) {
      throw new AppError("not-found", "Usuário não encontrado");
    }

    return {
      id: uid,
      email: userRecord.email || "",
      name: userData.name || userRecord.displayName || "",
      createdAt: userData.createdAt?.toDate().toISOString() || new Date().toISOString(),
    };
  }
}
