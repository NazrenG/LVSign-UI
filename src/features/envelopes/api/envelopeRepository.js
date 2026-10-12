import { devEnvelopeAdapter } from "./dev/devEnvelopeAdapter";

/**
 * Envelope data access — the ONLY module the editor's hooks talk to.
 *
 * Contract (every method returns a Promise of domain objects, see models/):
 *
 *   getEnvelope(envelopeId)             → Envelope
 *   createEnvelope({ title })           → Envelope            (status "draft")
 *   uploadDocument(envelopeId, File)    → EnvelopeDocument    (pages measured by the server)
 *   saveDraft(envelope)                 → { updatedAt, idMap } (idMap: temporary id → server id)
 *   sendEnvelope(envelopeId)            → { status }
 *
 * Errors: throw EnvelopeNotFoundError / InvalidDocumentError (envelopeErrors.js)
 * or a plain Error with a user-readable message.
 *
 * TODO(api): add an `apiEnvelopeAdapter` that implements this contract over
 * the shared apiClient once the ASP.NET Envelope endpoints exist, then switch
 * the export below. If the backend prefers granular endpoints (addRecipient,
 * updateField, deleteField …), implement saveDraft in that adapter by diffing
 * the last saved envelope against the new one — the editor does not change.
 */
export const envelopeRepository = devEnvelopeAdapter;
