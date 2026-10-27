/**
 * Front-end model of a signing session: what ONE recipient sees when they
 * open an envelope to sign. Deliberately separate from the sender's
 * Envelope model in features/envelopes — the recipient never edits
 * documents, recipients or field layout.
 *
 * Source (future): GET /api/signing/{envelopeId} → mappers/signingMapper.js
 */

/**
 * @typedef {Object} SigningSession
 * @property {string} envelopeId
 * @property {string} subject
 * @property {string} message             note from the sender ("" if none)
 * @property {string} envelopeStatus      see ENVELOPE_STATUS below
 * @property {string|null} expiresAt      ISO date-time
 * @property {{ name: string, email: string }} sender
 * @property {SigningRecipient} recipient the person signing now
 * @property {number} remainingRecipients other recipients still to act after this one
 * @property {SigningDocument[]} documents ordered
 * @property {SigningField[]} fields      this recipient's fields + other recipients' completed ones
 * @property {SavedMark[]} savedSignatures
 * @property {SavedMark[]} savedInitials
 * @property {SigningStamp[]} stamps      stamps this recipient may apply
 */

/**
 * @typedef {Object} SigningRecipient
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} status         RECIPIENT_STATUS
 * @property {string} recipientType  signer | approver | viewer | copy
 * @property {number} routingOrder
 */

/**
 * @typedef {Object} SigningDocument
 * @property {string} id
 * @property {string} fileName
 * @property {number} order
 * @property {number} pageCount
 * @property {string} fileUrl
 * @property {{ pageNumber: number, width: number, height: number }[]} pages  PDF points
 */

/**
 * @typedef {Object} SigningField
 * @property {string} id
 * @property {string} documentId
 * @property {string|null} recipientId
 * @property {string} recipientName
 * @property {boolean} isMine         belongs to the current recipient
 * @property {string} fieldType       see FIELD_TYPES in features/envelopes/models/fieldTypes
 * @property {string} label
 * @property {number} pageNumber
 * @property {number} x               0..1 of page width
 * @property {number} y               0..1 of page height
 * @property {number} width
 * @property {number} height
 * @property {boolean} isRequired
 * @property {*} value                saved value (others' fields, or a resumed session)
 * @property {string[]} options       radio / dropdown
 * @property {string|null} completedAt
 */

/**
 * A signature, initials or stamp mark as applied to a field.
 * @typedef {Object} Mark
 * @property {"drawn"|"typed"|"saved"|"stamp"} method
 * @property {string} [typedText]
 * @property {string} [fontKey]
 * @property {string} [imageDataUrl]  drawn strokes or stamp image (PNG/SVG data URL)
 * @property {string} [sourceId]      saved signature or stamp id
 */

/** @typedef {Mark & { id: string, label: string }} SavedMark */
/** @typedef {{ id: string, name: string, imageUrl: string }} SigningStamp */

export const ENVELOPE_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  IN_PROGRESS: "inProgress",
  COMPLETED: "completed",
  DECLINED: "declined",
  VOIDED: "voided",
  EXPIRED: "expired",
};

export const RECIPIENT_STATUS = {
  CREATED: "created",
  PENDING: "pending",
  ACTIVE: "active",
  VIEWED: "viewed",
  COMPLETED: "completed",
  DECLINED: "declined",
  DELEGATED: "delegated",
  SKIPPED: "skipped",
  CANCELED: "canceled",
};

/** Why the recipient can or cannot sign right now (utils/signingAccess.js). */
export const SIGNING_ACCESS = {
  READY: "ready",
  NOT_YOUR_TURN: "notYourTurn",
  EXPIRED: "expired",
  VOIDED: "voided",
  DECLINED: "declined",
  ALREADY_COMPLETED: "alreadyCompleted",
  NOTHING_TO_SIGN: "nothingToSign",
};

/** Where the signing screen is in its own flow. */
export const SIGNING_PHASE = {
  SIGNING: "signing",
  SUBMITTING: "submitting",
  COMPLETED: "completed",
  DECLINED: "declined",
};

/** Field types whose value is a Mark applied through a dialog. */
export const MARK_FIELD_TYPES = ["signature", "initials", "stamp"];

/** Filled in by the system; the recipient never types them. */
export const AUTO_FIELD_TYPES = ["dateSigned"];
