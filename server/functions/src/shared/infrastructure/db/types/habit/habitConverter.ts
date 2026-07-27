import type { BaseFirestoreResponse, Converter } from "../../../contracts/converter";
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { Habit } from "./habit";

export const habitConverter: Converter<Habit> = {
  toFirestore(data: Habit): DocumentData {
    return {
      name: data.name,
      target: data.target,
      unit: data.unit,
      color: data.color,
      iconKey: data.iconKey,
      current: data.current,
      userId: data.userId,
      lastResetDate: data.lastResetDate,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<Habit> {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      target: data.target,
      unit: data.unit,
      color: data.color,
      iconKey: data.iconKey,
      current: data.current ?? 0,
      userId: data.userId,
      lastResetDate: data.lastResetDate ?? new Date().toDateString(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};
