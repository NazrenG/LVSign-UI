import {
  ENVELOPE_STATUS,
  RECIPIENT_STATUS,
  SIGNING_ACCESS,
} from "../models/signingModel";

/**
 * Can this recipient sign right now? Order matters: an expired or voided
 * envelope wins over the recipient's own status.
 * The server stays authoritative; this only decides which screen to show.
 */
export function getSigningAccess(session, now = new Date()) {
  const { envelopeStatus, recipient, expiresAt } = session;

  if (envelopeStatus === ENVELOPE_STATUS.VOIDED) return SIGNING_ACCESS.VOIDED;
  if (recipient.status === RECIPIENT_STATUS.COMPLETED)
    return SIGNING_ACCESS.ALREADY_COMPLETED;
  if (
    envelopeStatus === ENVELOPE_STATUS.DECLINED ||
    recipient.status === RECIPIENT_STATUS.DECLINED
  )
    return SIGNING_ACCESS.DECLINED;
  if (
    envelopeStatus === ENVELOPE_STATUS.EXPIRED ||
    (expiresAt &&
      new Date(expiresAt) < now &&
      envelopeStatus !== ENVELOPE_STATUS.COMPLETED)
  )
    return SIGNING_ACCESS.EXPIRED;
  if (
    [RECIPIENT_STATUS.CREATED, RECIPIENT_STATUS.PENDING].includes(
      recipient.status,
    )
  )
    return SIGNING_ACCESS.NOT_YOUR_TURN;
  if (
    ![RECIPIENT_STATUS.ACTIVE, RECIPIENT_STATUS.VIEWED].includes(
      recipient.status,
    )
  )
    return SIGNING_ACCESS.VOIDED; // canceled, skipped, delegated: nothing left to do here
  if (!session.fields.some((field) => field.isMine))
    return SIGNING_ACCESS.NOTHING_TO_SIGN;
  return SIGNING_ACCESS.READY;
}
