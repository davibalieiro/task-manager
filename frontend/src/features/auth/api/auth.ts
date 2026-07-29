import {
  signInWithEmail as _signIn,
  signUpWithEmail as _signUp,
  signInWithGoogle as _signInWithGoogle,
  signOut as _signOut,
  syncSession,
  getSessionCookie,
} from "@/shared/infrastructure/config/auth";
import type { User } from "../types/auth";

const runBase = import.meta.env.VITE_RUN_BASE || ''

export interface AuthResult {
  user: User;
  token: string;
}

function getFunctionUrl(path: string): string {
  const functionName = path.replace(/^\//, '').toLowerCase()
  if (runBase) {
    return `https://${functionName}-${runBase}`
  }
  return `/api${path}`
}

async function getCurrentUser(): Promise<User> {
  const { firebaseAuth } = await import("@/shared/infrastructure/config/auth");
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Não autorizado");

  const token = getSessionCookie();
  if (!token) throw new Error("Sessão expirada");

  const res = await fetch(getFunctionUrl("/me"), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Usuário não encontrado");
  return res.json();
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResult> => {
    await _signIn(email, password);
    const token = await syncSession(true);
    if (!token) throw new Error("Erro ao sincronizar sessão");

    const res = await fetch(getFunctionUrl("/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erro ao buscar dados do usuário");
    const userData = await res.json();

    return { user: userData, token };
  },

  register: async (email: string, password: string, name: string): Promise<AuthResult> => {
    const credential = await _signUp(email, password);
    const token = await credential.user.getIdToken() as string;

    const regRes = await fetch(getFunctionUrl("/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, name }),
    });

    if (!regRes.ok) {
      const error = await regRes.json().catch(() => ({ message: 'Erro ao registrar' }))
      throw new Error(error.message || 'Erro ao registrar')
    }

    await syncSession(true);

    const res = await fetch(getFunctionUrl("/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erro ao buscar dados do usuário");
    const userData = await res.json();

    return { user: userData, token: token as string };
  },

  googleLogin: async (): Promise<AuthResult> => {
    await _signInWithGoogle();
    const token = await syncSession(true);
    if (!token) throw new Error("Erro ao sincronizar sessão");

    const { firebaseAuth } = await import("@/shared/infrastructure/config/auth");
    const firebaseUser = firebaseAuth.currentUser;
    if (!firebaseUser) throw new Error("Erro ao obter usuário Google");

    const res = await fetch(getFunctionUrl("/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const userData = await res.json();
      return { user: userData, token };
    }

    // First time Google login - register the user
    await fetch(getFunctionUrl("/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Usuário",
      }),
    });

    await syncSession(true);

    const meRes = await fetch(getFunctionUrl("/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!meRes.ok) throw new Error("Erro ao buscar dados do usuário");
    const userData = await meRes.json();

    return { user: userData, token };
  },

  logout: async (): Promise<void> => {
    await _signOut();
  },

  me: () => getCurrentUser(),
};
