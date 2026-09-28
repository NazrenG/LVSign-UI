import { cn } from "@/utils/cn";

/**
 * Section title with optional inline description and a right-aligned action.
 * <SectionHeading title="Frequently used" description="Based on the last 30 days" />
 */
export function SectionHeading({ title, description, action, className }) {
  return (
    <div
      className={cn("mb-3 flex items-center justify-between gap-4", className)}
    >
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description && (
          <span className="text-[13px] text-ink-muted">{description}</span>
        )}
      </div>
      {action}
    </div>
  );
}
