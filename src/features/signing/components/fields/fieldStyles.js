import { cn } from "@/utils/cn";

/**
 * Visual state of a field box. Muted fills from the existing tokens:
 * required → primary tint, optional → dashed neutral, done → success tint.
 */
export function fieldBoxClass({ isRequired, isComplete, isActive, isAuto }) {
  return cn(
    "absolute rounded-[3px] border transition-[box-shadow,background-color,border-color]",
    isAuto
      ? "border-transparent bg-canvas-muted/80"
      : isComplete
        ? "border-success/40 bg-success-soft/60"
        : isRequired
          ? "border-primary/70 bg-primary-soft/85"
          : "border-dashed border-line-strong bg-surface/85",
    isActive
      ? "z-20 ring-2 ring-primary ring-offset-1 ring-offset-surface"
      : "z-10",
  );
}

/** Invisible larger touch target for small boxes (checkbox, initials). */
export const TOUCH_TARGET =
  "before:absolute before:-inset-2 before:content-['']";
