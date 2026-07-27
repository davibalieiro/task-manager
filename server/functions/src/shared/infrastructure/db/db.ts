import { getFirestore } from "firebase-admin/firestore";
import { app } from "../config/firebase";

export const db = getFirestore(app);
