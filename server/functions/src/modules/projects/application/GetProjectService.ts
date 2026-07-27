import * as logger from "firebase-functions/logger";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { db } from "../../../shared/infrastructure/db/db";
import { projectConverter } from "../../../shared/infrastructure/db/types/project/projectConverter";

export interface ProjectResult {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class GetProjectService {
  async execute(uid: string, projectId: string): Promise<ProjectResult> {
    logger.info("Getting project", { uid, projectId });

    const doc = await db
      .collection("projects")
      .withConverter(projectConverter)
      .doc(projectId)
      .get();

    if (!doc.exists) {
      throw new AppError("not-found", "Projeto não encontrado");
    }

    const data = doc.data()!;

    if (data.userId !== uid) {
      throw new AppError("permission-denied", "Sem permissão para acessar este projeto");
    }

    logger.info("Project retrieved successfully", { projectId, uid });

    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      color: data.color,
      status: data.status,
      userId: data.userId,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
    };
  }
}
