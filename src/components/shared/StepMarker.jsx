import { cn } from "@/utils/cn";

/**
 * Generic step states, independent of any domain.
 * Features map their own states onto these (e.g. signer "signed" -> "done").
 */
export const STEP_STATE = {
  DONE: "done",
  START: "start",
  CURRENT: "current",
  PENDING: "pending",
  WARNING: "warning",
  DANGER: "danger",
};

const CIRCLE_STYLES = {
  [STEP_STATE.DONE]: "bg-ink border-ink",
  [STEP_STATE.START]: "bg-surface border-ink",
  [STEP_STATE.CURRENT]: "bg-surface border-primary",
  [STEP_STATE.PENDING]: "bg-surface border-ink-subtle",
  [STEP_STATE.WARNING]: "bg-surface border-warning",
  [STEP_STATE.DANGER]: "bg-surface border-danger",
};

/** Round marker for a step; a "done" one gets a white centre dot. */
export function StepMarker({ state = STEP_STATE.PENDING, className }) {
  return (
    <span
      className={cn(
        "relative z-10 inline-flex size-4 shrink-0 items-center justify-center rounded-full border-2",
        CIRCLE_STYLES[state],
        className,
      )}
    >
      {state === STEP_STATE.DONE && (
        <span className="size-1.5 rounded-full bg-surface" />
      )}
    </span>
  );
}

const END_STYLES = {
  pending: "border-ink-subtle bg-surface",
  success: "border-success bg-success",
  danger: "border-danger bg-danger",
};

/** Square marker for the final step ("Completed", "Expires"). */
export function EndMarker({ tone = "pending", className }) {
  return (
    <span
      className={cn(
        "relative z-10 inline-block size-3.5 shrink-0 border-2",
        END_STYLES[tone],
        className,
      )}
    />
  );
}
