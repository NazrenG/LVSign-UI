import { RoleChain } from "@/components/shared";
import { AGREEMENT_STATUS, SIGNER_STATE } from "../agreementStatus";
import { getPerson } from "../agreementSelectors";

const AVATAR_VARIANT = {
  [SIGNER_STATE.SIGNED]: "filled",
  [SIGNER_STATE.CURRENT]: "active",
  [SIGNER_STATE.PENDING]: "outline",
  [SIGNER_STATE.NOT_SENT]: "outline",
  [SIGNER_STATE.DECLINED]: "danger",
};

/** Statuses whose route never reaches a "Completed" end. */
const TERMINATED = [AGREEMENT_STATUS.DECLINED, AGREEMENT_STATUS.VOIDED];

/** Compact avatar route for tables and lists: (LH)─(FA)─(OG)─□ */
export function SignerChain({ agreement, className }) {
  const items = agreement.signers.map((signer) => {
  const person = getPerson(signer.personId);

  return {
    key: signer.recipientId ?? signer.personId,
    name: signer.name ?? person?.name ?? "Unknown",
    variant: AVATAR_VARIANT[signer.state],
  };
});

  return (
    <RoleChain
      items={items}
      showEnd={!TERMINATED.includes(agreement.status)}
      endTone={
        agreement.status === AGREEMENT_STATUS.COMPLETED ? "success" : "pending"
      }
      className={className}
    />
  );
}
