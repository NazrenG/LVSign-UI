import { CircleAlert, Check } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/utils/cn";

/** "Ready to publish": one line per step, with a check or a warning. */
export function PublishChecklistCard({ checks, version, onStepChange }) {
  const isReady = checks.every((check) => check.isValid);

  return (
    <Card className="p-5">
      <h3 className="mb-3 text-base font-semibold text-ink">
        {isReady ? "Ready to publish" : "Not ready to publish"}
      </h3>
      <ul className="space-y-3">
        {checks.map((check) => {
          const Icon = check.isValid ? Check : CircleAlert;
          return (
            <li key={check.stepId} className="flex gap-3">
              <Icon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  check.isValid ? "text-success" : "text-danger",
                )}
                strokeWidth={2}
                aria-hidden
              />
              <div>
                <button
                  type="button"
                  onClick={() => onStepChange(check.stepId)}
                  className="text-left text-[15px] font-medium text-ink hover:text-primary"
                >
                  {check.label}
                </button>
                <p
                  className={cn(
                    "text-[13px]",
                    check.isValid ? "text-ink-muted" : "text-danger",
                  )}
                >
                  {check.summary}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 border-t border-line pt-3 text-[13px] text-ink-muted">
        Publishing creates version {version + 1}.
        {version > 0 &&
          ` Documents already sent keep using version ${version}.`}
      </p>
    </Card>
  );
}
