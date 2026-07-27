import * as logger from "firebase-functions/logger";
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

export class ListProjectsService {
  async execute(uid: string): Promise<ProjectResult[]> {
    logger.info("Listing projects", { uid });

    const snapshot = await db
      .collection("projects")
      .withConverter(projectConverter)
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      color: doc.data().color,
      status: doc.data().status,
      userId: doc.data().userId,
      createdAt: doc.data().createdAt.toDate().toISOString(),
      updatedAt: doc.data().updatedAt.toDate().toISOString(),
    }));

    logger.info("Projects listed successfully", { uid, count: projects.length });

    return projects;
  }
}
