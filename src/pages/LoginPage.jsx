import { useEffect, useState } from "react";
import { InteractionStatus } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

import { useCurrentUser } from "@/features/auth/CurrentUserProvider";
import { AUTH_STATUS } from "@/features/auth/authStatus";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { MicrosoftSignInPanel } from "@/features/auth/components/MicrosoftSignInPanel";
import { loginRequest } from "@/features/auth/msalConfig";
import { useMicrosoftLogout } from "@/features/auth/useMicrosoftLogout";

export function LoginPage() {
  const { instance, accounts, inProgress } = useMsal();
  const { currentUser, loading, error } = useCurrentUser();

  const navigate = useNavigate();
  const signOut = useMicrosoftLogout();

  const [errorMessage, setErrorMessage] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const account = instance.getActiveAccount() ?? accounts[0] ?? null;

  const isBusy = signingIn || inProgress !== InteractionStatus.None;

  // Microsoft authentication + LV.SignFlow access verified.
  useEffect(() => {
    if (!account || loading) return;

    if (currentUser) {
      navigate("/", { replace: true });
      return;
    }

    if (error?.status === 403) {
      navigate("/access-denied", { replace: true });
      return;
    }

    if (error?.code === "SESSION_EXPIRED") {
      navigate("/session-expired", { replace: true });
    }
  }, [account, loading, currentUser, error, navigate]);

  const handleSignIn = async () => {
    if (isBusy) return;

    setErrorMessage("");
    setSigningIn(true);

    try {
      // Always show Microsoft account selection.
      const result = await instance.loginPopup({
        ...loginRequest,
        prompt: "select_account",
      });

      if (!result.account) {
        throw new Error("Microsoft did not return an account.");
      }

      // IMPORTANT: establish the selected account first.
      instance.setActiveAccount(result.account);

      // CurrentUserProvider performs /api/auth/me verification.
      // No duplicated API request here.
    } catch (err) {
      console.error("[MSAL LOGIN ERROR]", err);

      setErrorMessage(
        err?.message ?? "Microsoft sign-in could not be completed.",
      );
    } finally {
      setSigningIn(false);
    }
  };

  const status = errorMessage
    ? AUTH_STATUS.error
    : isBusy
      ? AUTH_STATUS.authenticating
      : AUTH_STATUS.unauthenticated;

  return (
    <AuthLayout footer="Need access? Contact your IT administrator.">
      <h1 className="font-serif text-4xl text-ink">Welcome to LV Sign</h1>

      <p className="mt-3 mb-8 text-[15px] text-ink-muted">
        Sign in securely with your Microsoft account.
      </p>

      {account ? (
        <div className="space-y-4 rounded-lg border border-line bg-surface p-6">
          <p className="text-sm text-ink-muted">Microsoft account:</p>

          <p className="font-medium text-ink break-all">{account.username}</p>

          {loading ? (
            <p>Verifying LV.SignFlow access...</p>
          ) : error ? (
            <p role="alert" className="text-sm text-danger">
              {error.status === 403
                ? "Your Microsoft account is not authorized."
                : error.message}
            </p>
          ) : (
            <p>Checking your account...</p>
          )}

          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-md border border-line px-4 py-3 text-sm font-medium"
          >
            Sign out / Use another account
          </button>
        </div>
      ) : (
        <MicrosoftSignInPanel
          status={status}
          errorMessage={errorMessage}
          onSignIn={handleSignIn}
          onRetry={handleSignIn}
        />
      )}
    </AuthLayout>
  );
}
