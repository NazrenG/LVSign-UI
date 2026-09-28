import { cn } from "@/utils/cn";

/** Label + control + hint. Every form control goes through this wrapper. */
export function FormField({ label, hint, htmlFor, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-[13px] text-ink-muted">{hint}</p>}
    </div>
  );
}
