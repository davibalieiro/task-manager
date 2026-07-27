import * as logger from "firebase-functions/logger";
import { db } from "../../../shared/infrastructure/db/db";
import { tagConverter } from "../../../shared/infrastructure/db/types/tag/tagConverter";
import { taskTagConverter } from "../../../shared/infrastructure/db/types/taskTag/taskTagConverter";

export interface TagResult {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagWithTaskCount extends TagResult {
  taskCount: number;
}

export class ListTagsService {
  async execute(uid: string): Promise<TagResult[]> {
    logger.info("Listing tags for user", { uid });

    const snapshot = await db
      .collection("tags")
      .withConverter(tagConverter)
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const tags: TagResult[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        color: data.color,
        userId: data.userId,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      };
    });

    logger.info(`Found ${tags.length} tags`, { uid });
    return tags;
  }

  async executeWithTaskCount(uid: string): Promise<TagWithTaskCount[]> {
    const tags = await this.execute(uid);

    const taskTagsSnapshot = await db
      .collection("taskTags")
      .withConverter(taskTagConverter)
      .where("userId", "==", uid)
      .get();

    const tagTaskCounts: Record<string, number> = {};
    taskTagsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      tagTaskCounts[data.tagId] = (tagTaskCounts[data.tagId] || 0) + 1;
    });

    return tags.map((tag) => ({
      ...tag,
      taskCount: tagTaskCounts[tag.id] || 0,
    }));
  }
}
