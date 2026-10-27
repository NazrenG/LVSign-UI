/** Errors the signing screen knows how to present, independent of transport. */
export class SigningSessionNotFoundError extends Error {
  constructor(envelopeId) {
    super(`Signing session for envelope ${envelopeId} was not found.`);
    this.name = "SigningSessionNotFoundError";
  }
}

/** The signed-in person is not a recipient of this envelope (HTTP 403). */
export class SigningAccessDeniedError extends Error {
  constructor() {
    super("You are not a recipient of this agreement.");
    this.name = "SigningAccessDeniedError";
  }
}
