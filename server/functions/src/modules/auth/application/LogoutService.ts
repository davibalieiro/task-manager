import * as logger from "firebase-functions/logger";
import { auth } from "../../../shared/infrastructure/config/firebase";

export class LogoutService {
  async execute(uid: string): Promise<void> {
    logger.info("Revoking refresh tokens", { uid });
    await auth.revokeRefreshTokens(uid);
    logger.info("User logged out successfully", { uid });
  }
}
