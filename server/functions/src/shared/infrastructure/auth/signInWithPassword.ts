import { AppError } from "../exception/AppError";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ uid: string; idToken: string }> {
  if (!FIREBASE_API_KEY) {
    throw new AppError("failed-precondition", "FIREBASE_API_KEY não configurado");
  }

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const data = await res.json();

  if (data.error) {
    const code = data.error.message;
    if (code === "EMAIL_NOT_FOUND") {
      throw new AppError("not-found", "Usuário não encontrado");
    }
    if (code === "INVALID_PASSWORD" || code === "INVALID_EMAIL") {
      throw new AppError("invalid-argument", "Email ou senha incorretos");
    }
    if (code === "TOO_MANY_ATTEMPTS_TRY_LATER") {
      throw new AppError("resource-exhausted", "Muitas tentativas. Tente novamente mais tarde");
    }
    throw new AppError("internal", "Erro ao autenticar");
  }

  if (!data.localId || !data.idToken) {
    throw new AppError("internal", "Resposta inválida do servidor de autenticação");
  }

  return { uid: data.localId, idToken: data.idToken };
}
