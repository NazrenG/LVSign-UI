import { Check } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/utils/cn";
import { BUILDER_STEPS } from "../../templateConstants";

function StepBadge({ number, status }) {
  if (status === "done") {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-ink text-white">
        <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-full border-[1.5px] text-xs font-medium",
        status === "current"
          ? "border-primary text-primary"
          : "border-ink-subtle text-ink-muted",
      )}
    >
      {number}
    </span>
  );
}

/** ✓ Basic info ──── ② Roles & workflow ──── ③ Fields ──── ④ Expiry */
export function BuilderStepper({ currentStep, onStepChange }) {
  const currentIndex = BUILDER_STEPS.findIndex(
    (step) => step.id === currentStep,
  );

  return (
    <nav aria-label="Template steps">
      {/* Full stepper from xl up */}
      <ol className="hidden items-center gap-3 xl:flex">
        {BUILDER_STEPS.map((step, index) => {
          const status =
            index < currentIndex
              ? "done"
              : index === currentIndex
                ? "current"
                : "todo";
          return (
            <Fragment key={step.id}>
              {index > 0 && (
                <li
                  aria-hidden
                  className={cn(
                    "h-0.5 w-10 2xl:w-16",
                    index <= currentIndex ? "bg-ink" : "bg-line",
                  )}
                />
              )}
              <li>
                <button
                  type="button"
                  onClick={() => onStepChange(step.id)}
                  aria-current={status === "current" ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-1 py-1 text-[15px] whitespace-nowrap",
                    status === "todo" ? "text-ink-muted" : "text-ink",
                    status === "current" && "font-semibold",
                  )}
                >
                  <StepBadge number={index + 1} status={status} />
                  {step.label}
                </button>
              </li>
            </Fragment>
          );
        })}
      </ol>

      {/* Compact progress below xl */}
      <div className="flex items-center gap-3 xl:hidden">
        <div className="flex gap-1.5" aria-hidden>
          {BUILDER_STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              tabIndex={-1}
              onClick={() => onStepChange(step.id)}
              className={cn(
                "h-1.5 w-6 rounded-full",
                index <= currentIndex ? "bg-primary" : "bg-line",
              )}
            />
          ))}
        </div>
        <span className="text-sm text-ink-muted">
          Step {currentIndex + 1} of {BUILDER_STEPS.length} ·{" "}
          <span className="font-medium text-ink">
            {BUILDER_STEPS[currentIndex].label}
          </span>
        </span>
      </div>
    </nav>
  );
}
