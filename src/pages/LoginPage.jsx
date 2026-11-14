import { AUTH_STATUS } from "@/features/auth/authStatus";
import { authIntegration } from "@/features/auth/authIntegration";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { MicrosoftSignInPanel } from "@/features/auth/components/MicrosoftSignInPanel";

/**
 * Sign-in with Microsoft Entra ID (UI only).
 *
 * The legacy department / email / password form (features/auth/components/
 * LoginForm) is kept in the codebase until the Entra migration is complete,
 * but is no longer shown. `status` and the actions will come from the MSAL
 * integration; until then the button calls a clearly named placeholder that
 * does not sign anyone in.
 */
export function LoginPage() {
  const status = AUTH_STATUS.unauthenticated;

  return (
    <AuthLayout footer="Need access? Contact your IT administrator.">
      <h1 className="font-serif text-4xl text-ink">Welcome to LV.SignFlow</h1>
      <p className="mt-3 mb-8 text-[15px] text-ink-muted">
        Sign in securely with your LV Logistics work account.
      </p>
      <MicrosoftSignInPanel
        status={status}
        onSignIn={authIntegration.signInWithMicrosoft}
        onRetry={authIntegration.retrySignIn}
      />
    </AuthLayout>
  );
}
