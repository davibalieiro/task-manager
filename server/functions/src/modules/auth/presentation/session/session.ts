import { Handler } from "../../../../shared/infrastructure/exception/Handler";
import { AppError } from "../../../../shared/infrastructure/exception/AppError";
import { auth } from "../../../../shared/infrastructure/config/firebase";

interface SessionInput {
  idToken: string;
}

interface SessionResult {
  success: boolean;
}

class SessionHandler extends Handler<SessionInput, SessionResult> {
  async handle(input: SessionInput, _uid: string): Promise<SessionResult> {
    const { idToken } = input;

    if (!idToken) {
      throw new AppError("invalid-argument", "ID token is required");
    }

    try {
      await auth.verifyIdToken(idToken);
      return { success: true };
    } catch (_error) {
      throw new AppError("unauthenticated", "Invalid ID token");
    }
  }
}

export const session = new SessionHandler().toFunction();
