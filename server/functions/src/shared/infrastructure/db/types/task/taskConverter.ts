import type {
  BaseFirestoreResponse,
  Converter,
} from "../../../contracts/converter";
import type {
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import type { Task } from "./task";

export const taskConverter: Converter<Task> = {
  toFirestore(data: Task): DocumentData {
    return {
      title: data.title,
      description: data.description,
      completed: data.completed,
      status: data.status,
      position: data.position,
      userId: data.userId,
      ...(data.projectId ? { projectId: data.projectId } : {}),
      ...(data.dueDate ? { dueDate: data.dueDate } : {}),
      subtasks: data.subtasks || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<Task> {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      title: data.title,
      description: data.description,
      completed: data.completed,
      status: data.status || "todo",
      position: data.position ?? 0,
      userId: data.userId,
      projectId: data.projectId,
      dueDate: data.dueDate,
      subtasks: data.subtasks || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};
