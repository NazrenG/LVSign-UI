import { useId } from "react";
import { cn } from "@/utils/cn";

export const inputStyles =
  "h-11 w-full rounded-sm border border-line-strong bg-surface px-3.5 text-[15px] text-ink " +
  "placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** Text input with an optional label wired up for accessibility. */
export function Input({ label, id, className, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input id={inputId} className={cn(inputStyles, className)} {...props} />
    </div>
  );
}
