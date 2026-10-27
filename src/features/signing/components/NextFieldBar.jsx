import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/formatters";

/**
 * Guides the recipient: Start → Next → Finish.
 * Floating at the bottom of the document on desktop, a full-width bar on phones.
 */
export function NextFieldBar({
  progress,
  hasStarted,
  nextField,
  documentsById,
  onStart,
  onNext,
  onFinish,
  isSubmitting,
}) {
  let text;
  let action;

  if (progress.isComplete) {
    text = (
      <span className="flex items-center gap-1.5 font-medium text-success">
        <CheckCircle2 className="size-4" aria-hidden /> All required fields
        completed
      </span>
    );
    action = (
      <Button onClick={onFinish} disabled={isSubmitting}>
        Finish
      </Button>
    );
  } else if (!hasStarted) {
    text = (
      <span className="text-ink">
        {pluralize(progress.remainingCount, "required field")} to complete
      </span>
    );
    action = (
      <Button onClick={onStart} icon={ArrowRight}>
        Start
      </Button>
    );
  } else {
    const document = documentsById[nextField?.documentId];
    text = (
      <span className="min-w-0 text-ink-muted">
        <span className="hidden sm:inline">Next required field: </span>
        <span className="font-medium text-ink">{nextField?.label}</span>
        {document && (
          <span className="hidden md:inline">
            {" "}
            · page {nextField.pageNumber}
            {Object.keys(documentsById).length > 1 &&
              ` of ${document.fileName}`}
          </span>
        )}
      </span>
    );
    action = (
      <Button onClick={onNext} icon={ArrowRight}>
        Next
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-0 sm:bottom-6 sm:px-4",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full items-center justify-between gap-4 border-t border-line bg-surface px-4 pt-3 text-[14px] shadow-[0_-8px_24px_-16px_rgb(0_0_0/0.25)]",
          "pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:w-auto sm:min-w-[26rem] sm:rounded-md sm:border sm:pb-3 sm:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.3)]",
        )}
      >
        <span className="flex min-w-0 items-center truncate">{text}</span>
        <span className="shrink-0">{action}</span>
      </div>
    </div>
  );
}
