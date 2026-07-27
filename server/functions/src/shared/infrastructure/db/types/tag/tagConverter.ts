import type {
  BaseFirestoreResponse,
  Converter,
} from "../../../contracts/converter";
import type {
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import type { Tag } from "./tag";

export const tagConverter: Converter<Tag> = {
  toFirestore(data: Tag): DocumentData {
    return {
      name: data.name,
      color: data.color,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<Tag> {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      color: data.color,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};
