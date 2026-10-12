/** Errors the editor knows how to present, independent of the transport. */
export class EnvelopeNotFoundError extends Error {
  constructor(envelopeId) {
    super(`Envelope ${envelopeId} was not found.`);
    this.name = "EnvelopeNotFoundError";
  }
}

export class InvalidDocumentError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidDocumentError";
  }
}
