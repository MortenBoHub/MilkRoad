import { useState } from "react";

/**
 * The signed-in identity the client remembers: a projection of the API's `User`
 * (id + name + admin flag). The password hash never reaches the browser.
 */
export interface AuthUser {
  userId: number;
  userName: string;
  /** Seeded demo admins only; unlocks the /admin category manager. */
  isAdmin: boolean;
}

/** Auth request lifecycle; "submitting" on submit rather than "loading" on mount. */
export type AuthStatus = "idle" | "submitting" | "success" | "error";

/**
 * ATOMS layer: state only. The logic that moves it lives in hooks/useAuth.tsx.
 * `initialUser` seeds a remembered session without an effect (no logged-out flash).
 */
export function useAuthState(initialUser: AuthUser | null = null) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  return { user, setUser, status, setStatus, error, setError };
}
