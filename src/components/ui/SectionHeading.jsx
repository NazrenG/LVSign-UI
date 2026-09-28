import { cn } from "@/utils/cn";

/** Section title with an optional right-aligned action (e.g. "View all"). */
export function SectionHeading({ title, action, className }) {
  return (
    <div
      className={cn("mb-3 flex items-center justify-between gap-4", className)}
    >
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {action}
    </div>
  );
}
