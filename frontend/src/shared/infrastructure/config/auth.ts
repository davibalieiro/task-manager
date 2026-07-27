import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as _signOut,
} from "firebase/auth";
import { app } from "./firebase";

export const firebaseAuth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signInWithGoogle() {
  return signInWithPopup(firebaseAuth, googleProvider);
}


export async function signOut() {
  await _signOut(firebaseAuth);
  // Clear session cookie
  document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "__claims=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export async function syncSession(forceRefresh = false): Promise<string | undefined> {
  const user = firebaseAuth.currentUser;
  if (!user) return undefined;

  const idToken = await user.getIdToken(forceRefresh);

  const isSecure = window.location.protocol === 'https:'
  document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Strict; ${isSecure ? 'Secure' : ''}`

  return idToken;
}

export function getSessionCookie(): string | null {
  const match = document.cookie.match(/__session=([^;]+)/);
  return match ? match[1] : null;
}
