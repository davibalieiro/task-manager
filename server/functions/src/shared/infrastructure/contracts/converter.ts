import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

export type BaseFirestoreResponse<T> = T & {
  id: string;
};

export interface Converter<T> {
  toFirestore(data: T): DocumentData;
  fromFirestore(snapshot: QueryDocumentSnapshot): BaseFirestoreResponse<T>;
}
