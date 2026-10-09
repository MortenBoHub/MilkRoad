import { useState } from "react";

/** Which form the auth view is showing. */
export type AuthMode = "login" | "register";

/** Per-field validation messages, keyed by field name. */
export interface AuthFieldErrors {
  username?: string;
  password?: string;
}

/**
 * ATOMS layer: raw auth-form state. Validation and submitting are logic, so they
 * live in hooks/useAuthForm.ts.
 */
export function useAuthFormState() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  return {
    mode,
    setMode,
    username,
    setUsername,
    password,
    setPassword,
    fieldErrors,
    setFieldErrors,
  };
}
