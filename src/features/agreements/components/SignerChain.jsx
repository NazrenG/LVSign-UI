import { Avatar } from "@/components/ui";
import { cn } from "@/utils/cn";
import { AGREEMENT_STATUS, SIGNER_STATE } from "../agreementStatus";
import { getPerson } from "../agreementSelectors";
import { CompletionMarker } from "./StepMarker";

const AVATAR_VARIANT = {
  [SIGNER_STATE.SIGNED]: "filled",
  [SIGNER_STATE.CURRENT]: "active",
  [SIGNER_STATE.PENDING]: "outline",
  [SIGNER_STATE.NOT_SENT]: "outline",
  [SIGNER_STATE.DECLINED]: "danger",
};

/** Statuses whose route never reaches a "Completed" end. */
const TERMINATED = [AGREEMENT_STATUS.DECLINED, AGREEMENT_STATUS.VOIDED];

const Connector = () => <span className="h-0.5 w-2 bg-ink" aria-hidden />;

/** Compact avatar route for tables and lists: (LH)─(FA)─(OG)─□ */
export function SignerChain({ agreement, className }) {
  const showEnd = !TERMINATED.includes(agreement.status);

  return (
    <div className={cn("flex items-center", className)}>
      {agreement.signers.map((signer, index) => {
        const { name } = getPerson(signer.personId);
        return (
          <span key={signer.personId} className="flex items-center">
            {index > 0 && <Connector />}
            <Avatar
              name={name}
              size="sm"
              variant={AVATAR_VARIANT[signer.state]}
            />
          </span>
        );
      })}
      {showEnd && (
        <>
          <Connector />
          <CompletionMarker
            isComplete={agreement.status === AGREEMENT_STATUS.COMPLETED}
            className="size-3"
          />
        </>
      )}
    </div>
  );
}
