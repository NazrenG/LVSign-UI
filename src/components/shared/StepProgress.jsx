import { cn } from "@/utils/cn";
import { EndMarker, STEP_STATE, StepMarker } from "./StepMarker";

const REACHED = [STEP_STATE.DONE, STEP_STATE.CURRENT];

const LABEL_TONE = {
  [STEP_STATE.CURRENT]: "text-primary",
  [STEP_STATE.DANGER]: "text-danger",
};

/**
 * Horizontal route: ● A ── ● B ── ○ C ── □ Completed
 *
 * steps: [{ key, label, caption?, state }]
 * end:   { label, tone } for the trailing square, or null to hide it.
 */
export function StepProgress({
  steps,
  end = { label: "Completed", tone: "pending" },
  className,
}) {
  const items = end
    ? [
        ...steps,
        {
          key: "__end",
          label: end.label,
          state: end.tone === "success" ? STEP_STATE.DONE : STEP_STATE.PENDING,
          isEnd: true,
          tone: end.tone,
        },
      ]
    : steps;

  return (
    <ol className={cn("flex", className)}>
      {items.map((step, index) => {
        const next = items[index + 1];
        return (
          <li
            key={step.key}
            className="relative flex min-w-0 flex-1 flex-col items-center text-center"
          >
            {next && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[7px] left-1/2 h-0.5 w-full",
                  REACHED.includes(next.state) ? "bg-ink" : "bg-line",
                )}
              />
            )}
            <span className="flex h-4 items-center">
              {step.isEnd ? (
                <EndMarker tone={step.tone} />
              ) : (
                <StepMarker state={step.state} />
              )}
            </span>
            <span
              className={cn(
                "mt-2 px-1 text-xs font-medium sm:text-[13px]",
                step.isEnd
                  ? "font-normal text-ink-muted"
                  : (LABEL_TONE[step.state] ?? "text-ink"),
              )}
            >
              {step.label}
            </span>
            {step.caption && (
              <span className="mt-0.5 font-mono text-[11px] text-ink-muted sm:text-xs">
                {step.caption}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
