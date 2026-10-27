import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, LogoMark } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const TONES = {
  neutral: "bg-canvas-muted text-ink-muted",
  info: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

/**
 * Full-screen message for every non-signing state: loading, unavailable,
 * completed, declined. Same quiet language as the app's other status pages.
 */
export function SigningStatusScreen({
  icon: Icon,
  tone = "neutral",
  title,
  message,
  subject,
  note,
  showBackLink = true,
  isLoading = false,
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
        <LogoMark />
        <span className="font-serif text-xl text-ink">Sign</span>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="flex max-w-md flex-col items-center gap-4 text-center"
          role={isLoading ? "status" : undefined}
        >
          {isLoading ? (
            <Loader2
              className="size-7 animate-spin text-ink-muted"
              aria-hidden
            />
          ) : (
            Icon && (
              <span
                className={cn(
                  "inline-flex size-14 items-center justify-center rounded-full",
                  TONES[tone],
                )}
              >
                <Icon className="size-7" strokeWidth={1.75} aria-hidden />
              </span>
            )
          )}
          {title && (
            <h1 className="font-serif text-3xl text-balance text-ink">
              {title}
            </h1>
          )}
          {message && <p className="text-[15px] text-ink-muted">{message}</p>}
          {subject && (
            <p className="rounded-sm border border-line bg-surface px-3 py-1.5 text-[14px] text-ink">
              {subject}
            </p>
          )}
          {note && <p className="text-[13px] text-ink-subtle">{note}</p>}
          {showBackLink && !isLoading && (
            <Button
              as={Link}
              to={ROUTES.agreements}
              variant="secondary"
              icon={ArrowLeft}
              className="mt-2"
            >
              Back to Agreements
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
