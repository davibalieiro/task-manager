import type { BaseFirestoreResponse, Converter } from "../../../contracts/converter";
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { Goal } from "./goal";

export const goalConverter: Converter<Goal> = {
  toFirestore(data: Goal): DocumentData {
    return {
      name: data.name,
      target: data.target,
      unit: data.unit,
      current: data.current,
      color: data.color,
      iconKey: data.iconKey,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<Goal> {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      target: data.target,
      unit: data.unit,
      current: data.current ?? 0,
      color: data.color,
      iconKey: data.iconKey,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};
