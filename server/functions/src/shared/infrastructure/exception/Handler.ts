import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import type { Request } from "firebase-functions/v2/https";
import { auth } from "../config/firebase";
import { AppError } from "./AppError";

function getCorsHeaders(origin?: string) {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
    process.env.ALLOWED_ORIGIN,
  ].filter((o): o is string => !!o);

  const isAllowed = !origin || allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? (origin || "*") : (allowedOrigins[0] || "*"),
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function sendCors(res: { setHeader: (key: string, value: string) => void }, origin?: string) {
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

/**
 * Abstract base for all onRequest v2 handlers.
 *
 * Subclasses implement `handle()` with pure business orchestration.
 * Error normalisation and CORS are handled here.
 */
export abstract class Handler<TInput = unknown, TOutput = unknown> {
  abstract handle(input: TInput, uid: string): Promise<TOutput>;

  toFunction() {
    return onRequest({ cors: true }, async (req, res) => {
      sendCors(res as { setHeader: (key: string, value: string) => void }, req.headers.origin as string | undefined);

      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }

      try {
        const uid = await this.verifyAuth(req);
        const input = req.method === "GET" ? req.query : req.body;
        const result = await this.handle(input as TInput, uid);
        res.status(200).json(result);
      } catch (error) {
        if (error instanceof AppError) {
          logger.warn(`AppError [${error.code}]: ${error.message}`, {
            details: error.details,
          });
          res.status(this.mapCodeToStatus(error.code)).json({
            message: error.message,
            details: error.details,
          });
          return;
        }

        logger.error("Unhandled exception in handler", { error });
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    });
  }

  private async verifyAuth(req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("unauthenticated", "Não autorizado");
    }

    const token = authHeader.split("Bearer ")[1];
    const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

    if (emulatorHost && process.env.NODE_ENV !== "production") {
      const parts = token.split(".");
      if (parts.length !== 3) throw new AppError("unauthenticated", "Token inválido");
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
      const uid = payload.user_id || payload.sub;
      if (typeof uid !== "string") throw new AppError("unauthenticated", "Token inválido");
      return uid;
    }

    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  }

  private mapCodeToStatus(code: string): number {
    const map: Record<string, number> = {
      unauthenticated: 401,
      "not-found": 404,
      "already-exists": 409,
      "invalid-argument": 400,
      "permission-denied": 403,
      aborted: 400,
    };
    return map[code] || 500;
  }
}
