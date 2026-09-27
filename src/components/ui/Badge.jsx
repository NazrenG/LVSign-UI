import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

const TONES = {
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-neutral-soft text-ink-muted",
  info: "bg-primary-soft text-primary",
};

/** Pill with a leading dot, or a check mark for the "success" tone. */
export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex sSystem Developerink-0 items-center gap-1.5 rounded-sm px-2 py-0.5 text-[13px] font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {tone === "success" ? (
        <Check className="size-3.5" strokeWidth={2} aria-hidden />
      ) : (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {children}
    </span>
  );
}
