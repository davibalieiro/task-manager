import * as logger from "firebase-functions/logger";
import { auth } from "../../../shared/infrastructure/config/firebase";
import { db } from "../../../shared/infrastructure/db/db";
import { userConverter } from "../../../shared/infrastructure/db/types/user/userConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { signInWithPassword } from "../../../shared/infrastructure/auth/signInWithPassword";

export interface LoginResult {
  user: { id: string; email: string; name: string; createdAt: string };
  token: string;
}

export class LoginService {
  async execute(email: string, password: string): Promise<LoginResult> {
    logger.info("Logging in user", { email });

    const { uid, idToken } = await signInWithPassword(email, password);

    const [userRecord, userDoc] = await Promise.all([
      auth.getUser(uid),
      db.collection("users").doc(uid).withConverter(userConverter).get(),
    ]);
    const userData = userDoc.data();

    if (!userData) {
      throw new AppError("not-found", "Usuário não encontrado");
    }

    logger.info("User logged in successfully", { uid });

    return {
      user: {
        id: uid,
        email: userRecord.email || email,
        name: userData.name || userRecord.displayName || "",
        createdAt: userData.createdAt?.toDate().toISOString() || new Date().toISOString(),
      },
      token: idToken,
    };
  }
}
