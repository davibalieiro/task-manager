import type {
  BaseFirestoreResponse,
  Converter,
} from "../../../contracts/converter";
import type {
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import type { User } from "./user";

export const userConverter: Converter<User> = {
  toFirestore(data: User): DocumentData {
    const { id, ...rest } = data;
    return rest;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<User> {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      email: data.email,
      name: data.name,
      createdAt: data.createdAt,
    };
  },
};
