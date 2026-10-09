import {
  useAuthFormState,
  type AuthFieldErrors,
  type AuthMode,
} from "@/atoms/authFormAtom";
import { useAuth } from "@/hooks/useAuth";

/**
 * HOOKS layer: the auth form's logic — validation, submit, error clearing.
 * Drives the authFormAtom and calls into useAuth; returns data + callbacks.
 */

/** Register enforces minimum lengths; login only requires non-empty. */
function validate(
  mode: AuthMode,
  username: string,
  password: string,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const name = username.trim();

  if (!name) {
    errors.username = "Username is required.";
  } else if (mode === "register" && name.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (mode === "register" && password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

export function useAuthForm() {
  const {
    mode,
    setMode,
    username,
    setUsername,
    password,
    setPassword,
    fieldErrors,
    setFieldErrors,
  } = useAuthFormState();

  const { status, error, login, register, clearError } = useAuth();

  function changeUsername(value: string) {
    setUsername(value);
    if (fieldErrors.username) {
      setFieldErrors((previous) => ({ ...previous, username: undefined }));
    }
    clearError();
  }

  function changePassword(value: string) {
    setPassword(value);
    if (fieldErrors.password) {
      setFieldErrors((previous) => ({ ...previous, password: undefined }));
    }
    clearError();
  }

  function toggleMode() {
    setMode((current) => (current === "login" ? "register" : "login"));
    setFieldErrors({});
    clearError();
  }

  /** Validate, then call the API. Resolves true on success. */
  async function submit(): Promise<boolean> {
    const errors = validate(mode, username, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    const name = username.trim();
    return mode === "login" ? login(name, password) : register(name, password);
  }

  return {
    mode,
    username,
    password,
    fieldErrors,
    formError: status === "error" ? error : null,
    submitting: status === "submitting",
    changeUsername,
    changePassword,
    toggleMode,
    submit,
  };
}
