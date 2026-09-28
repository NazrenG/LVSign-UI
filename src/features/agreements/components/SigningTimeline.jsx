import { VerticalSteps } from "@/components/shared";
import { formatDateTime } from "@/utils/formatters";
import {
  AGREEMENT_STATUS,
  SIGNER_STATE,
  SIGNER_STEP_STATE,
} from "../agreementStatus";
import { getPerson } from "../agreementSelectors";

function getTimelineCaption(signer) {
  switch (signer.state) {
    case SIGNER_STATE.SIGNED:
      return `Signed ${formatDateTime(signer.date)}`;
    case SIGNER_STATE.CURRENT:
      return `Waiting since ${formatDateTime(signer.date)}`;
    case SIGNER_STATE.DECLINED:
      return `Declined ${formatDateTime(signer.date)}`;
    case SIGNER_STATE.NOT_SENT:
      return "Not sent";
    default:
      return "Not yet";
  }
}

/** Vertical signing route used in the agreement detail panel. */
export function SigningTimeline({ agreement }) {
  const steps = agreement.signers.map((signer) => {
    const person = getPerson(signer.personId);
    return {
      key: signer.personId,
      title: person.name,
      subtitle: person.title,
      caption: getTimelineCaption(signer),
      state: SIGNER_STEP_STATE[signer.state],
    };
  });

  const isComplete = agreement.status === AGREEMENT_STATUS.COMPLETED;

  return (
    <VerticalSteps
      steps={steps}
      end={{ label: "Completed", tone: isComplete ? "success" : "pending" }}
    />
  );
}
