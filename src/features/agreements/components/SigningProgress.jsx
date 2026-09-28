import { StepProgress } from "@/components/shared";
import { CURRENT_USER } from "@/data/people";
import { AGREEMENT_STATUS, SIGNER_STEP_STATE } from "../agreementStatus";
import { getPerson, getSignerCaption } from "../agreementSelectors";

/**
 * Horizontal signing route: ● Aysel ── ● Farid ── ○ You ── □ Completed
 * Used on dashboard cards and in the signing page header.
 */
export function SigningProgress({ agreement, youLabel = "You", className }) {
  const steps = agreement.signers.map((signer) => {
    const isCurrentUser = signer.personId === CURRENT_USER.id;
    return {
      key: signer.personId,
      label: isCurrentUser ? youLabel : getPerson(signer.personId).name,
      caption: getSignerCaption(signer, { isCurrentUser }),
      state: SIGNER_STEP_STATE[signer.state],
    };
  });

  const isComplete = agreement.status === AGREEMENT_STATUS.COMPLETED;

  return (
    <StepProgress
      steps={steps}
      end={{ label: "Completed", tone: isComplete ? "success" : "pending" }}
      className={className}
    />
  );
}
