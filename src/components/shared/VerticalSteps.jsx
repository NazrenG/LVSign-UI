import { cn } from "@/utils/cn";
import { EndMarker, STEP_STATE, StepMarker } from "./StepMarker";

/**
 * Vertical route used in side panels.
 *
 * steps: [{ key, title, subtitle?, caption?, state }]
 * end:   { label, tone } for the trailing square, or null to hide it.
 */
export function VerticalSteps({
  steps,
  end = { label: "Completed", tone: "pending" },
}) {
  return (
    <ol>
      {steps.map((step) => (
        <li key={step.key} className="relative flex gap-3 pb-5">
          <span
            aria-hidden
            className={cn(
              "absolute top-4 bottom-0 left-[7px] w-0.5",
              step.state === STEP_STATE.DONE ? "bg-ink" : "bg-line",
            )}
          />
          <span className="pt-0.5">
            <StepMarker state={step.state} />
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                "text-[15px] font-medium",
                step.state === STEP_STATE.CURRENT ? "text-primary" : "text-ink",
              )}
            >
              {step.title}
            </p>
            {step.subtitle && (
              <p className="text-[13px] text-ink-muted">{step.subtitle}</p>
            )}
            {step.caption && (
              <p className="font-mono text-[13px] text-ink-muted">
                {step.caption}
              </p>
            )}
          </div>
        </li>
      ))}
      {end && (
        <li className="flex items-center gap-3">
          <span className="flex w-4 justify-center">
            <EndMarker tone={end.tone} />
          </span>
          <span className="text-sm text-ink">{end.label}</span>
        </li>
      )}
    </ol>
  );
}
