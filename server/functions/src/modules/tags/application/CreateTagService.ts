import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { tagConverter } from "../../../shared/infrastructure/db/types/tag/tagConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";

export interface CreateTagResult {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class CreateTagService {
  async execute(
    uid: string,
    name: string,
    color: string,
  ): Promise<CreateTagResult> {
    logger.info("Creating tag", { uid, name });

    const now = Timestamp.now();
    const tagData = {
      name,
      color,
      userId: uid,
      createdAt: now,
      updatedAt: now,
    };

    const existingTag = await db.collection("tags").where("userId", "==", uid).where("name", "==", name).limit(1).get();
    if (!existingTag.empty) {
      throw new AppError("already-exists", "Já existe uma tag com este nome");
    }

    const docRef = await db
      .collection("tags")
      .withConverter(tagConverter)
      .add(tagData);

    logger.info("Tag created successfully", { tagId: docRef.id, uid });

    return {
      id: docRef.id,
      name,
      color,
      userId: uid,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }
}
