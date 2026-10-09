import type { FormEvent } from "react";
import type { AuthFieldErrors, AuthMode } from "@/atoms/authFormAtom";

export interface AuthFormProps {
  mode: AuthMode;
  username: string;
  password: string;
  fieldErrors: AuthFieldErrors;
  formError: string | null;
  submitting: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onToggleMode: () => void;
}

/**
 * COMPONENTS layer: props in, JSX out. Presentational only — no validation, no
 * state. The button labels come from `mode`; the shared `.form__*` classes are
 * reused by the create-listing form too.
 */
export function AuthForm({
  mode,
  username,
  password,
  fieldErrors,
  formError,
  submitting,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
}: AuthFormProps) {
  const isRegister = mode === "register";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    onSubmit();
  }

  return (
    <section className="form">
      <div className="form__bar">{isRegister ? "Create account" : "Log in"}</div>

      <form className="form__body" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p className="form__error" role="alert">
            {formError}
          </p>
        ) : null}

        <label className="form__field">
          <span className="form__label">Username</span>
          <input
            className="form__input"
            type="text"
            name="username"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            autoComplete="username"
            autoFocus
            aria-invalid={Boolean(fieldErrors.username)}
          />
          {fieldErrors.username ? (
            <span className="form__field-error">{fieldErrors.username}</span>
          ) : null}
        </label>

        <label className="form__field">
          <span className="form__label">Password</span>
          <input
            className="form__input"
            type="password"
            name="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            autoComplete={isRegister ? "new-password" : "current-password"}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          {fieldErrors.password ? (
            <span className="form__field-error">{fieldErrors.password}</span>
          ) : null}
        </label>

        <button className="form__submit" type="submit" disabled={submitting}>
          {submitting ? "Please wait…" : isRegister ? "Create account" : "Log in"}
        </button>

        <p className="form__toggle">
          {isRegister ? "Already have an account?" : "No account yet?"}{" "}
          <button
            type="button"
            className="form__toggle-btn"
            onClick={onToggleMode}
          >
            {isRegister ? "Log in" : "Create one"}
          </button>
        </p>
      </form>
    </section>
  );
}
