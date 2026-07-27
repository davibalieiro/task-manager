import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { firebaseAuth, syncSession } from "../infrastructure/config/auth";

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setState({ user: null, loading: false });
        return;
      }

      try {
        await syncSession(false);
      } catch {
        // Sync failed, continue with auth state
      }

      setState({ user, loading: false });
    });

    return unsubscribe;
  }, []);

  return state;
}
