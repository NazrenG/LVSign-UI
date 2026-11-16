import { useEffect, useState } from "react";
import { InteractionStatus } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/CurrentUserProvider";
import { AUTH_STATUS } from "@/features/auth/authStatus";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { MicrosoftSignInPanel } from "@/features/auth/components/MicrosoftSignInPanel";
import { loginRequest } from "@/features/auth/msalConfig";
import { authenticatedFetch } from "@/features/auth/authenticatedFetch";

export function LoginPage() {
  const { instance, accounts, inProgress } = useMsal();
  useEffect(() => {
    console.log("[MSAL] Status:", inProgress);
    console.log("[MSAL] Account count:", accounts.length);
    console.log("[MSAL] Active account:", Boolean(instance.getActiveAccount()));
  }, [instance, accounts, inProgress]);
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenReady, setTokenReady] = useState(false);

  const account = instance.getActiveAccount() ?? accounts[0] ?? null;

  const isBusy = inProgress !== InteractionStatus.None;

  const navigate = useNavigate();

  const { currentUser, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && currentUser?.userId) {
      navigate("/", { replace: true });
    }
  }, [currentUser?.userId, loading, navigate]);

  useEffect(() => {
    if (!account || isBusy) return;

    let cancelled = false;

    async function verifyTokenAcquisition() {
      try {
        const result = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        if (!cancelled) {
          setTokenReady(Boolean(result.accessToken));
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setTokenReady(false);
          setErrorMessage(
            error?.message ?? "Unable to acquire an API access token.",
          );
        }
      }
    }

    verifyTokenAcquisition();

    return () => {
      cancelled = true;
    };
  }, [account, instance, isBusy]);

  useEffect(() => {
    const callbackId = instance.addEventCallback((event) => {
      if (
        event.eventType.includes("LOGIN") ||
        event.eventType.includes("HANDLE_REDIRECT") ||
        event.eventType.includes("ACQUIRE_TOKEN")
      ) {
        console.log("[MSAL EVENT]", event.eventType);

        if (event.error) {
          console.error(
            "[MSAL ERROR]",
            event.error.errorCode,
            event.error.message,
          );
        }
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance]);

  const handleSignIn = async () => {
    setErrorMessage("");

    try {
      const result = await instance.loginPopup(loginRequest);

      if (!result.account) {
        throw new Error(
          "Microsoft authentication completed without an account.",
        );
      }
      const response = await authenticatedFetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/me`,
      );

      console.log("[Auth Me] Status:", response.status);

      if (response.ok) {
        const currentUser = await response.json();

        console.log(
          "[Auth Me] Internal User ID available:",
          Boolean(currentUser.userId),
        );
      }

      instance.setActiveAccount(result.account);

      console.log("[MSAL] Login popup succeeded");
      console.log("[MSAL] Account count:", instance.getAllAccounts().length);
      console.log(
        "[MSAL] API access token received:",
        Boolean(result.accessToken),
      );
    } catch (error) {
      console.error(
        "[MSAL] Login failed:",
        error?.errorCode ?? error?.name,
        error?.message,
      );

      setErrorMessage(
        error?.message ?? "Microsoft sign-in could not be completed.",
      );
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
        Sign in securely with your LV Logistics work account.
      </p>

      <MicrosoftSignInPanel
        status={status}
        errorMessage={errorMessage}
        onSignIn={handleSignIn}
        onRetry={handleSignIn}
      />
      {account && tokenReady && (
        <p className="mt-4 text-sm text-ink-muted" role="status">
          Microsoft sign-in completed. LV Sign access verification is not
          connected yet.
        </p>
      )}
    </AuthLayout>
  );
}
