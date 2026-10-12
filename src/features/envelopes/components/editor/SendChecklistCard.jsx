import { Check, CircleAlert } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/utils/cn";

const MAX_ISSUES_PER_CHECK = 4;

/**
 * "Ready to send" — same pattern as the template builder's publish checklist.
 * Issues are clickable: they jump to the field or recipient that needs work.
 */
export function SendChecklistCard({ checks, onIssueSelect, className }) {
  const isReady = checks.every((check) => check.isValid);

  return (
    <Card className={cn("p-5", className)}>
      <h3 className="mb-3 text-base font-semibold text-ink">
        {isReady ? "Ready to send" : "Before you send"}
      </h3>
      <ul className="space-y-3">
        {checks.map((check) => {
          const Icon = check.isValid ? Check : CircleAlert;
          return (
            <li key={check.id} className="flex gap-3">
              <Icon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  check.isValid ? "text-success" : "text-danger",
                )}
                strokeWidth={2}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-ink">
                  {check.label}
                </p>
                {check.isValid ? (
                  <p className="text-[13px] text-ink-muted">{check.summary}</p>
                ) : (
                  <ul className="mt-0.5 space-y-0.5">
                    {check.issues
                      .slice(0, MAX_ISSUES_PER_CHECK)
                      .map((issue, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            onClick={() => onIssueSelect?.(issue)}
                            disabled={!issue.fieldId && !issue.recipientId}
                            className="text-left text-[13px] text-danger hover:underline disabled:no-underline"
                          >
                            {issue.message}
                          </button>
                        </li>
                      ))}
                    {check.issues.length > MAX_ISSUES_PER_CHECK && (
                      <li className="text-[13px] text-danger">
                        + {check.issues.length - MAX_ISSUES_PER_CHECK} more
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
