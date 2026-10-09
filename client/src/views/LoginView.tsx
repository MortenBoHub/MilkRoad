import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthForm } from "@/components/AuthForm";
import { BackToProducts } from "@/components/BackToProducts";
import { useAuth } from "@/hooks/useAuth";
import { useAuthForm } from "@/hooks/useAuthForm";

/**
 * VIEWS layer: assembles the auth hooks with the auth component.
 *
 * One route handles both "log in" and "create account" — the mode lives in the
 * form hook and the form itself toggles it, so App.tsx stays routes-only and we
 * avoid two near-identical views.
 */
export function LoginView() {
  const { user } = useAuth();
  const form = useAuthForm();
  const navigate = useNavigate();

  // A successful sign-in (or an already-remembered session) sends the user back
  // to the marketplace.
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  return (
    <div className="page">
      <main className="narrow">
        <h1 className="narrow__title">MilkRoad</h1>
        <p className="narrow__note">
          Sign in to buy and sell. Passwords are hashed before they are stored.
        </p>

        <AuthForm
          mode={form.mode}
          username={form.username}
          password={form.password}
          fieldErrors={form.fieldErrors}
          formError={form.formError}
          submitting={form.submitting}
          onUsernameChange={form.changeUsername}
          onPasswordChange={form.changePassword}
          onSubmit={form.submit}
          onToggleMode={form.toggleMode}
        />

        <BackToProducts />
      </main>
    </div>
  );
}
