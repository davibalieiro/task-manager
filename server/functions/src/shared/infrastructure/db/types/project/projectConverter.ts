import type {
  BaseFirestoreResponse,
  Converter,
} from "../../../contracts/converter";
import type {
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import type { Project } from "./project";

export const projectConverter: Converter<Project> = {
  toFirestore(data: Project): DocumentData {
    return {
      name: data.name,
      description: data.description,
      color: data.color,
      status: data.status,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<Project> {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      name: data.name,
      description: data.description,
      color: data.color,
      status: data.status,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};
