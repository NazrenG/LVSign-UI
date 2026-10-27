import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

/** "2 of 5 required fields completed" with a slim bar; calm success when done. */
export function RequiredFieldsProgress({ progress, className }) {
  const { completedCount, requiredCount, isComplete } = progress;
  const ratio = requiredCount ? completedCount / requiredCount : 1;

  if (isComplete) {
    return (
      <p
        role="status"
        className={cn(
          "flex items-center gap-1.5 text-[13px] font-medium text-success",
          className,
        )}
      >
        <CheckCircle2 className="size-4" aria-hidden />
        All required fields completed
      </p>
    );
  }

  return (
    <div role="status" className={cn("flex items-center gap-3", className)}>
      <span className="text-[13px] whitespace-nowrap text-ink-muted">
        <span className="font-medium text-ink tabular-nums">
          {completedCount}
        </span>{" "}
        of <span className="tabular-nums">{requiredCount}</span> required fields
        completed
      </span>
      <span
        className="hidden h-1 w-24 overflow-hidden rounded-full bg-line sm:block"
        aria-hidden
      >
        <span
          className="block h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${ratio * 100}%` }}
        />
      </span>
    </div>
  );
}
