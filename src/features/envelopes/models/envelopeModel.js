/**
 * Front-end domain model for envelopes.
 *
 *   Template  = reusable blueprint (features/templates)
 *   Envelope  = one real signing transaction           ← the editor works on this
 *   Document  = a file inside an envelope (many per envelope)
 *   Recipient = a participant in an envelope
 *   Field     = a box on one page of one document, assigned to one recipient
 *
 * These shapes mirror the planned ASP.NET entities (Envelope, EnvelopeDocument,
 * EnvelopeRecipient, EnvelopeField, EnvelopeRoutingRuleSet …). Components only
 * ever see these shapes; translating to/from the API happens in mappers/.
 */

/**
 * @typedef {Object} Envelope
 * @property {string} id
 * @property {string} title
 * @property {EnvelopeStatus} status
 * @property {RoutingMode} routingMode
 * @property {{ displayName: string, email: string }} sender
 * @property {string} emailSubject
 * @property {string} emailMessage
 * @property {string|null} dueDate              ISO date ("2026-10-24") or null
 * @property {number} reminderEveryDays         0 = no reminders
 * @property {EnvelopeDocument[]} documents     ordered
 * @property {EnvelopeRecipient[]} recipients
 * @property {EnvelopeField[]} fields
 * @property {EnvelopeRoutingRule[]} routingRules  conditional routing (not editable yet)
 * @property {string} updatedAt                 ISO date-time
 */

/**
 * @typedef {Object} EnvelopeDocument
 * @property {string} id
 * @property {string} name
 * @property {string} fileUrl        where the PDF can be fetched for rendering
 * @property {number} order          1-based position inside the envelope
 * @property {EnvelopePage[]} pages
 */

/**
 * @typedef {Object} EnvelopePage
 * @property {number} pageNumber     1-based
 * @property {number} width          page size in PDF points — only the ratio matters to the editor
 * @property {number} height
 */

/**
 * @typedef {Object} EnvelopeRecipient
 * @property {string} id
 * @property {string} displayName
 * @property {string} email
 * @property {string} [roleName]     optional label, e.g. "Operations manager"
 * @property {RecipientType} recipientType
 * @property {number} routingOrder   1-based; equal numbers sign in parallel
 * @property {boolean} isRequired
 * @property {RecipientStatus} status
 * @property {RecipientPermissions} permissions
 */

/**
 * @typedef {Object} RecipientPermissions
 * @property {boolean} allowSenderEditRecipient
 * @property {boolean} allowSenderDeleteRecipient
 * @property {boolean} allowSenderChangeRoutingOrder
 */

/**
 * @typedef {Object} EnvelopeField
 * @property {string} id
 * @property {string} documentId
 * @property {number} pageNumber     1-based
 * @property {string|null} recipientId
 * @property {FieldType} type
 * @property {string} label
 * @property {boolean} isRequired
 * @property {string[]} [options]    dropdown / radio
 * @property {number} x              left edge, 0..1 of page width
 * @property {number} y              top edge, 0..1 of page height
 * @property {number} width          0..1 of page width
 * @property {number} height         0..1 of page height
 */

/**
 * @typedef {Object} EnvelopeRoutingRule
 * @property {string} id
 * @property {string} sourceFieldId
 * @property {string} operator
 * @property {string} value
 * @property {string} targetRecipientId
 */

/** @typedef {"draft"|"sent"|"completed"|"declined"|"voided"} EnvelopeStatus */
export const ENVELOPE_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  COMPLETED: "completed",
  DECLINED: "declined",
  VOIDED: "voided",
};

/** @typedef {"sequential"|"parallel"} RoutingMode */
export const ROUTING_MODE = {
  SEQUENTIAL: "sequential",
  PARALLEL: "parallel",
};

/** @typedef {"created"|"sent"|"delivered"|"completed"|"declined"} RecipientStatus */
export const RECIPIENT_STATUS = {
  CREATED: "created",
  SENT: "sent",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  DECLINED: "declined",
};

export const DEFAULT_RECIPIENT_PERMISSIONS = {
  allowSenderEditRecipient: true,
  allowSenderDeleteRecipient: true,
  allowSenderChangeRoutingOrder: true,
};
