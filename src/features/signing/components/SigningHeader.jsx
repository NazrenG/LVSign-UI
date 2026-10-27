import { LogoMark, Button, Menu } from "@/components/ui";
import { RequiredFieldsProgress } from "./RequiredFieldsProgress";

/** Calm, single-row header: what you're signing, how far along, Finish. */
export function SigningHeader({
  session,
  progress,
  canFinish,
  isSubmitting,
  onFinish,
  menuItems,
}) {
  return (
    <header className="shrink-0 border-b border-line bg-surface">
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <LogoMark className="shrink-0" />
        <span className="hidden h-6 w-px bg-line sm:block" aria-hidden />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-lg leading-tight text-ink sm:text-xl">
            {session.subject}
          </h1>
          <p className="hidden truncate text-[13px] text-ink-muted lg:block">
            From {session.sender.name}
            {session.recipient.name &&
              ` · Signing as ${session.recipient.name}`}
          </p>
          {/* Below lg the header has no room for the progress bar: show the count here. */}
          <p className="truncate text-[12.5px] text-ink-muted lg:hidden">
            {progress.isComplete
              ? "All required fields completed"
              : `${progress.completedCount} of ${progress.requiredCount} required fields completed`}
          </p>
        </div>
        <RequiredFieldsProgress
          progress={progress}
          className="hidden lg:flex"
        />
        <Menu label="Other actions" items={menuItems} />
        <span className="hidden sm:block">
          <Button onClick={onFinish} disabled={!canFinish || isSubmitting}>
            Finish
          </Button>
        </span>
      </div>
    </header>
  );
}
