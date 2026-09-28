import { CURRENT_USER } from "@/data/people";
import { cn } from "@/utils/cn";
import { AGREEMENT_STATUS, SIGNER_STATE } from "../agreementStatus";
import { getPerson, getSignerCaption } from "../agreementSelectors";
import { CompletionMarker, SignerMarker } from "./StepMarker";

const REACHED_STATES = [SIGNER_STATE.SIGNED, SIGNER_STATE.CURRENT];

/**
 * Horizontal signing route: ● Aysel ── ● Farid ── ○ You ── □ Completed
 * Used on dashboard cards and in the signing page header.
 */
export function SigningProgress({ agreement, youLabel = "You", className }) {
  const isComplete = agreement.status === AGREEMENT_STATUS.COMPLETED;

  const steps = [
    ...agreement.signers.map((signer) => {
      const isCurrentUser = signer.personId === CURRENT_USER.id;
      return {
        key: signer.personId,
        label: isCurrentUser ? youLabel : getPerson(signer.personId).name,
        caption: getSignerCaption(signer, { isCurrentUser }),
        isActive: signer.state === SIGNER_STATE.CURRENT,
        isReached: REACHED_STATES.includes(signer.state),
        marker: <SignerMarker state={signer.state} />,
      };
    }),
    {
      key: "completed",
      label: "Completed",
      caption: null,
      isActive: false,
      isReached: isComplete,
      marker: <CompletionMarker isComplete={isComplete} />,
    },
  ];

  return (
    <ol className={cn("flex", className)}>
      {steps.map((step, index) => {
        const nextStep = steps[index + 1];
        return (
          <li
            key={step.key}
            className="relative flex min-w-0 flex-1 flex-col items-center text-center"
          >
            {nextStep && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[7px] left-1/2 h-0.5 w-full",
                  nextStep.isReached ? "bg-ink" : "bg-line",
                )}
              />
            )}
            <span className="flex h-4 items-center">{step.marker}</span>
            <span
              className={cn(
                "mt-2 px-1 text-xs font-medium sm:text-[13px]",
                step.isActive ? "text-primary" : "text-ink",
                step.key === "completed" && "font-normal text-ink-muted",
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
