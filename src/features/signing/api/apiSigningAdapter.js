import { fromSigningSessionDto } from "../mappers/signingMapper";
import {
  SigningAccessDeniedError,
  SigningSessionNotFoundError,
} from "./signingErrors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const notAvailable = (action) =>
  Promise.reject(
    new Error(
      `${action} is not available yet: the signing API has no endpoint for it.`,
    ),
  );

/**
 * Signing API adapter. Only the session read is agreed with the backend
 * (GET /api/signing/{envelopeId}). Submit and decline are deliberately not
 * guessed: add them here when their endpoints exist, using
 * toCompleteSigningDto() from mappers/signingMapper.js for the body.
 */
export const apiSigningAdapter = {
  async getSession(envelopeId) {
    const response = await fetch(`${API_BASE_URL}/api/signing/${envelopeId}`);
    if (response.status === 404)
      throw new SigningSessionNotFoundError(envelopeId);
    if (response.status === 401 || response.status === 403)
      throw new SigningAccessDeniedError();
    if (!response.ok)
      throw new Error("The agreement could not be opened. Please try again.");
    return fromSigningSessionDto(await response.json(), {
      apiBaseUrl: API_BASE_URL,
    });
  },

  // TODO(api): POST the toCompleteSigningDto(session, values) body to the finish endpoint.
  completeSigning: () => notAvailable("Finishing"),

  // TODO(api): POST { recipientId, reason } to the decline endpoint.
  declineSigning: () => notAvailable("Declining"),
};
