import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { auth } from "../../../shared/infrastructure/config/firebase";
import { db } from "../../../shared/infrastructure/db/db";
import { userConverter } from "../../../shared/infrastructure/db/types/user/userConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { signInWithPassword } from "../../../shared/infrastructure/auth/signInWithPassword";

export interface RegisterResult {
  user: { id: string; email: string; name: string; createdAt: string };
  token: string;
}

export class RegisterService {
  async execute(email: string, password: string, name: string): Promise<RegisterResult> {
    logger.info("Registering new user", { email });

    let userRecord;
    try {
      userRecord = await auth.createUser({ email, password, displayName: name });
    } catch (error: any) {
      if (error.message?.includes("auth/email-already-exists")) {
        throw new AppError("already-exists", "Este email já está em uso");
      }
      throw error;
    }

    const now = Timestamp.now();
    try {
      await db.collection("users").doc(userRecord.uid).withConverter(userConverter).set({
        id: userRecord.uid,
        email,
        name,
        createdAt: now,
      });
    } catch (error) {
      logger.error("Failed to create user document, cleaning up auth user", { uid: userRecord.uid });
      await auth.deleteUser(userRecord.uid).catch(() => {});
      throw new AppError("internal", "Erro ao criar perfil do usuário");
    }

    const { idToken } = await signInWithPassword(email, password);

    logger.info("User registered successfully", { uid: userRecord.uid });

    return {
      user: {
        id: userRecord.uid,
        email,
        name,
        createdAt: now.toDate().toISOString(),
      },
      token: idToken,
    };
  }
}
