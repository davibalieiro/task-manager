import type {
  BaseFirestoreResponse,
  Converter,
} from "../../../contracts/converter";
import type {
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import type { TaskTag } from "./taskTag";

export const taskTagConverter: Converter<TaskTag> = {
  toFirestore(data: TaskTag): DocumentData {
    return {
      taskId: data.taskId,
      tagId: data.tagId,
      userId: data.userId,
      createdAt: data.createdAt,
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<TaskTag> {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      taskId: data.taskId,
      tagId: data.tagId,
      userId: data.userId,
      createdAt: data.createdAt,
    };
  },
};
