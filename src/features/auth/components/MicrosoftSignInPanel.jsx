import { AlertCircle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui";
import { AUTH_STATUS } from "../authStatus";
import { MicrosoftSignInButton } from "./MicrosoftSignInButton";

const DEFAULT_ERROR =
  "We couldn't sign you in with Microsoft. Please try again.";

/**
 * Sign-in card for Microsoft Entra ID. Presentation only: the parent passes
 * the current status and the callbacks (MSAL-backed later).
 *
 * status: "unauthenticated" | "authenticating" | "error"
 */
export function MicrosoftSignInPanel({
  status = AUTH_STATUS.unauthenticated,
  errorMessage,
  onSignIn,
  onRetry,
}) {
  const isLoading = status === AUTH_STATUS.authenticating;
  const isError = status === AUTH_STATUS.error;

  return (
    <Card className="p-5 sm:p-7">
      <MicrosoftSignInButton
        onClick={isError && onRetry ? onRetry : onSignIn}
        loading={isLoading}
      >
        {isError ? "Try again with Microsoft" : "Continue with Microsoft"}
      </MicrosoftSignInButton>

      {/* Fixed-height message slot: switching states doesn't move the layout. */}
      <div className="mt-4 min-h-[3.25rem]" aria-live="polite">
        {isError ? (
          <p
            role="alert"
            className="flex items-start gap-2.5 rounded-md bg-danger-soft px-3 py-2.5 text-[14px] text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{errorMessage || DEFAULT_ERROR}</span>
          </p>
        ) : (
          <p className="flex items-start gap-2.5 px-0.5 py-2.5 text-[14px] text-ink-muted">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-ink-subtle"
              strokeWidth={1.75}
              aria-hidden
            />
            <span>
              {isLoading
                ? "Complete sign-in in the Microsoft window to continue."
                : "Use your company Microsoft account to access LV Sign."}
            </span>
          </p>
        )}
      </div>
    </Card>
  );
}
