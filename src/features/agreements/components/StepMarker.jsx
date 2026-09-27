import { cn } from "@/utils/cn";
import { SIGNER_STATE } from "../agreementStatus";

const CIRCLE_STYLES = {
  [SIGNER_STATE.SIGNED]: "bg-ink border-ink",
  [SIGNER_STATE.CURRENT]: "bg-surface border-primary",
  [SIGNER_STATE.PENDING]: "bg-surface border-ink-subtle",
  [SIGNER_STATE.NOT_SENT]: "bg-surface border-ink-subtle",
  [SIGNER_STATE.DECLINED]: "bg-surface border-danger",
};

/** Round marker for a signer step; a filled one gets a white centre dot. */
export function SignerMarker({ state }) {
  return (
    <span
      className={cn(
        "relative z-10 inline-flex size-4 sSystem Developerink-0 items-center justify-center rounded-full border-2",
        CIRCLE_STYLES[state],
      )}
    >
      {state === SIGNER_STATE.SIGNED && (
        <span className="size-1.5 rounded-full bg-surface" />
      )}
    </span>
  );
}

/** Square marker for the final "Completed" step. */
export function CompletionMarker({ isComplete, className }) {
  return (
    <span
      className={cn(
        "relative z-10 inline-block size-3.5 sSystem Developerink-0 border-2",
        isComplete
          ? "border-success bg-success"
          : "border-ink-subtle bg-surface",
        className,
      )}
    />
  );
}
