import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/api/client";
import { useAuthState, type AuthStatus, type AuthUser } from "@/atoms/authAtom";

/** localStorage key for the remembered session. */
const STORAGE_KEY = "milkroad.session";

/**
 * Read the remembered user. try/catch because `localStorage` can throw (storage
 * disabled, private browsing) and the stored JSON is untrusted; on any problem,
 * degrade to "logged out" rather than crash on boot.
 */
export function loadStoredUser(storage?: Pick<Storage, "getItem">): AuthUser | null {
  try {
    const store = storage ?? localStorage;
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as AuthUser).userId === "number" &&
      typeof (parsed as AuthUser).userName === "string"
    ) {
      return {
        userId: (parsed as AuthUser).userId,
        userName: (parsed as AuthUser).userName,
        // Sessions saved before admins existed have no flag: treat as non-admin.
        isAdmin: (parsed as AuthUser).isAdmin === true,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser | null): void {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — the session just won't survive a refresh.
  }
}

/**
 * The generated `User` has every field optional; our `AuthUser` requires id and
 * name. Returns null when the server sent something we can't use.
 */
export function toAuthUser(user: {
  userId?: number;
  userName?: string;
  isAdmin?: boolean;
}): AuthUser | null {
  if (typeof user.userId !== "number" || !user.userName) return null;
  return {
    userId: user.userId,
    userName: user.userName,
    isAdmin: user.isAdmin === true,
  };
}

/** Map transport/HTTP failures onto messages a person can act on. */
export function describeAuthError(
  error: unknown,
  action: "register" | "login",
): string {
  if (error instanceof Response) {
    if (error.status === 409) return "That username is already taken.";
    if (error.status === 401) return "Wrong username or password.";
    return `The server responded with ${error.status} ${error.statusText}.`;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  register: (userName: string, password: string) => Promise<boolean>;
  login: (userName: string, password: string) => Promise<boolean>;
  logout: () => void;
  /** Clear a previous error (used when the user edits the form again). */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * HOOKS layer, shared flavour. Auth must be visible in several places at once
 * (Header, login view), so it can't live in a per-component useState — that
 * would give each caller its own copy. A context holds one instance; useAuth
 * hands it to whoever asks.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Read the remembered session once, during the first render, to avoid a
  // logged-out flash before hydration.
  const [initialUser] = useState(() => loadStoredUser());
  const { user, setUser, status, setStatus, error, setError } =
    useAuthState(initialUser);

  async function authenticate(
    action: "register" | "login",
    userName: string,
    password: string,
  ): Promise<boolean> {
    setStatus("submitting");
    setError(null);

    try {
      const request = { userName, password };
      const result =
        action === "register"
          ? await api.api.baseUserRegister(request)
          : await api.api.baseUserLogin(request);

      const authUser = toAuthUser(result);
      if (!authUser) {
        throw new Error("The server returned an unexpected response.");
      }

      setUser(authUser);
      storeUser(authUser);
      setStatus("success");
      return true;
    } catch (err) {
      setError(describeAuthError(err, action));
      setStatus("error");
      return false;
    }
  }

  const value: AuthContextValue = {
    user,
    status,
    error,
    register: (userName, password) =>
      authenticate("register", userName, password),
    login: (userName, password) => authenticate("login", userName, password),
    logout: () => {
      setUser(null);
      storeUser(null);
      setStatus("idle");
      setError(null);
    },
    clearError: () => {
      setStatus("idle");
      setError(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Read the shared auth state. Throws if used outside the provider. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
