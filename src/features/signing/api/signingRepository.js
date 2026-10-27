import { apiSigningAdapter } from "./apiSigningAdapter";
import { devSigningAdapter } from "./dev/devSigningAdapter";

/**
 * Signing data access — the only module useSigningSession talks to.
 *
 *   getSession(envelopeId)              → SigningSession
 *   completeSigning(session, values)    → { recipientStatus, envelopeStatus, remainingRecipients }
 *   declineSigning(session, reason)     → { recipientStatus, envelopeStatus }
 *
 * Errors: SigningSessionNotFoundError, SigningAccessDeniedError (signingErrors.js)
 * or an Error with a readable message.
 *
 * The backend has no signing endpoints yet, so the development adapter is
 * the default. Set VITE_SIGNING_SOURCE=api to use the API adapter.
 */
export const signingRepository =
  import.meta.env.VITE_SIGNING_SOURCE === "api"
    ? apiSigningAdapter
    : devSigningAdapter;
