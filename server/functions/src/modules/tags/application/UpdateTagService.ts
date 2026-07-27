import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../shared/infrastructure/db/db";
import { tagConverter } from "../../../shared/infrastructure/db/types/tag/tagConverter";
import { AppError } from "../../../shared/infrastructure/exception/AppError";

export interface UpdateTagResult {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export class UpdateTagService {
  async execute(
    uid: string,
    tagId: string,
    data: { name?: string; color?: string },
  ): Promise<UpdateTagResult> {
    logger.info("Updating tag", { uid, tagId });

    const tagDoc = await db
      .collection("tags")
      .doc(tagId)
      .withConverter(tagConverter)
      .get();

    if (!tagDoc.exists) {
      throw new AppError("not-found", "Etiqueta não encontrada");
    }

    const tagData = tagDoc.data()!;
    if (tagData.userId !== uid) {
      throw new AppError("permission-denied", "Acesso negado");
    }

    const now = Timestamp.now();
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;

    await db.collection("tags").doc(tagId).update(updateData);

    logger.info("Tag updated successfully", { tagId, uid });

    return {
      id: tagId,
      name: data.name ?? tagData.name,
      color: data.color ?? tagData.color,
      userId: uid,
      createdAt: tagData.createdAt.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  }
}
