import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { projectConverter } from "../../../shared/infrastructure/db/types/project/projectConverter";

export interface CreateProjectResult {
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class CreateProjectService {
  async execute(
    uid: string,
    name: string,
    description: string,
    color: string,
  ): Promise<CreateProjectResult> {
    logger.info("Creating project", { uid, name });

    const now = Timestamp.now();
    const projectData = {
      name,
      description,
      color,
      status: "pending" as const,
      userId: uid,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db
      .collection("projects")
      .withConverter(projectConverter)
      .add(projectData);

    logger.info("Project created successfully", { projectId: docRef.id, uid });

    return {
      id: docRef.id,
      name,
      description,
      color,
      status: "pending",
      userId: uid,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }
}
