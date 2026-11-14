import { Clock3, LockKeyhole, LogOut, RotateCw, WifiOff } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/utils/cn";
import { AUTH_STATUS } from "../authStatus";

const VIEWS = {
  [AUTH_STATUS.accessDenied]: {
    icon: LockKeyhole,
    tone: "bg-canvas-muted text-ink",
    title: "Access to LV.SignFlow is restricted",
    message:
      "Your Microsoft account was verified, but you do not currently have access to this application.",
    hint: "If you need access, contact IT Support and mention the account you signed in with.",
  },
  [AUTH_STATUS.sessionExpired]: {
    icon: Clock3,
    tone: "bg-warning-soft text-warning",
    title: "Your session has expired",
    message: "Please sign in again to continue using LV.SignFlow.",
  },
  [AUTH_STATUS.error]: {
    icon: WifiOff,
    tone: "bg-danger-soft text-danger",
    title: "We couldn't complete sign-in",
    message:
      "LV.SignFlow couldn't be reached or something unexpected happened. Check your connection and try again.",
    hint: "If the problem continues, contact your IT administrator.",
  },
};

/**
 * One reusable view for the authentication outcomes that aren't the sign-in
 * form itself. Actions appear only when the parent provides their callback.
 *
 * status:  "accessDenied" | "sessionExpired" | "error"
 * account: optional "name@lv-logistics.com" of the verified Microsoft account
 */
export function AuthStatusView({
  status,
  account,
  message,
  onSignIn,
  onRetry,
  onSignOut,
  supportHref,
}) {
  // Unknown statuses fall back to the generic error view (with its actions).
  const kind = VIEWS[status] ? status : AUTH_STATUS.error;
  const view = VIEWS[kind];
  const Icon = view.icon;

  const actions = [];
  if (kind === AUTH_STATUS.sessionExpired && onSignIn) {
    actions.push(
      <Button key="signin" size="lg" onClick={onSignIn}>
        Sign in again
      </Button>,
    );
  }
  if (kind === AUTH_STATUS.error && onRetry) {
    actions.push(
      <Button key="retry" size="lg" icon={RotateCw} onClick={onRetry}>
        Try again
      </Button>,
    );
  }
  if (kind === AUTH_STATUS.accessDenied && supportHref) {
    actions.push(
      <Button key="support" as="a" href={supportHref} size="lg">
        Contact IT Support
      </Button>,
    );
  }
  if (onSignOut && kind !== AUTH_STATUS.sessionExpired) {
    actions.push(
      <Button
        key="signout"
        size="lg"
        variant="secondary"
        icon={LogOut}
        onClick={onSignOut}
      >
        Sign out
      </Button>,
    );
  }

  return (
    <section aria-labelledby="auth-status-title">
      <span
        className={cn(
          "inline-flex size-12 items-center justify-center rounded-full",
          view.tone,
        )}
      >
        <Icon className="size-6" strokeWidth={1.75} aria-hidden />
      </span>
      <h1
        id="auth-status-title"
        className="mt-6 font-serif text-3xl text-balance text-ink sm:text-4xl"
      >
        {view.title}
      </h1>
      <p className="mt-3 text-[15px] text-ink-muted">
        {message || view.message}
      </p>

      {account && (
        <Card className="mt-6 px-4 py-3">
          <p className="text-[13px] text-ink-muted">
            Signed in with Microsoft as
          </p>
          <p className="mt-0.5 font-mono text-[13px] break-all text-ink">
            {account}
          </p>
        </Card>
      )}

      {actions.length > 0 && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row [&>*]:sm:min-w-40">
          {actions}
        </div>
      )}

      {view.hint && (
        <p className="mt-6 text-[13px] text-ink-subtle">{view.hint}</p>
      )}
    </section>
  );
}
