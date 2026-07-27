import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../../shared/infrastructure/exception/AppError";
import { db } from "../../../shared/infrastructure/db/db";
import { projectConverter } from "../../../shared/infrastructure/db/types/project/projectConverter";
import type { ProjectStatus } from "../../../shared/infrastructure/db/types/project/project";

export interface UpdateProjectResult {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class UpdateProjectService {
  async execute(
    uid: string,
    projectId: string,
    data: { name?: string; description?: string; color?: string; status?: ProjectStatus },
  ): Promise<UpdateProjectResult> {
    logger.info("Updating project", { uid, projectId });

    const docRef = db
      .collection("projects")
      .withConverter(projectConverter)
      .doc(projectId);

    const doc = await docRef.get();

    if (!doc.exists) {
      throw new AppError("not-found", "Projeto não encontrado");
    }

    if (doc.data()!.userId !== uid) {
      throw new AppError("permission-denied", "Sem permissão para editar este projeto");
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.status !== undefined) updateData.status = data.status;

    await docRef.update(updateData);

    const updated = await docRef.get();
    const updatedData = updated.data()!;

    logger.info("Project updated successfully", { projectId, uid });

    return {
      id: projectId,
      name: updatedData.name,
      description: updatedData.description,
      color: updatedData.color,
      status: updatedData.status,
      userId: updatedData.userId,
      createdAt: updatedData.createdAt.toDate().toISOString(),
      updatedAt: updatedData.updatedAt.toDate().toISOString(),
    };
  }
}
