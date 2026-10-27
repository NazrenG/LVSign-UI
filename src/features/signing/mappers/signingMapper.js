/**
 * The only place that knows the transport shape of a signing session.
 *
 * TODO(api): align with the ASP.NET contract for GET /api/signing/{envelopeId}.
 * The DTO is assumed to be camelCase JSON. Enums may arrive as numbers
 * (as in the envelopes API) or as strings; both are accepted.
 */

const ENVELOPE_STATUS_BY_NUMBER = {
  1: "draft",
  2: "sent",
  3: "inProgress",
  4: "completed",
  5: "declined",
  6: "voided",
  7: "expired",
};

const RECIPIENT_STATUS_BY_NUMBER = {
  1: "created",
  2: "pending",
  3: "active",
  4: "viewed",
  5: "completed",
  6: "declined",
  7: "delegated",
  8: "skipped",
  9: "canceled",
};

const RECIPIENT_TYPE_BY_NUMBER = {
  1: "signer",
  2: "approver",
  3: "viewer",
  4: "copy",
};

// Same numbering as the envelopes API (FieldType enum on the server).
const FIELD_TYPE_BY_NUMBER = {
  1: "signature",
  2: "dateSigned",
  3: "text",
  4: "initials",
  5: "fullName",
  6: "email",
  7: "number",
  8: "checkbox",
  9: "radio",
  10: "dropdown",
  11: "stamp",
};

/** "Completed" / 4 / "completed" → "completed" */
function toEnum(value, byNumber, fallback) {
  if (typeof value === "number") return byNumber[value] ?? fallback;
  if (typeof value === "string" && value.length) {
    return value.charAt(0).toLowerCase() + value.slice(1);
  }
  return fallback;
}

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const A4 = { width: 595, height: 842 };

function fromDocumentDto(dto, envelopeId, apiBaseUrl) {
  const pageCount = toNumber(dto.pageCount, dto.pages?.length ?? 1);
  return {
    id: dto.id,
    fileName: dto.fileName ?? dto.name ?? "Document.pdf",
    order: toNumber(dto.order, 1),
    pageCount,
    // TODO(api): confirm the content endpoint for recipients.
    fileUrl:
      dto.fileUrl ??
      `${apiBaseUrl}/api/signing/${envelopeId}/documents/${dto.id}/content`,
    // Page sizes let fields be laid out before the PDF has loaded;
    // without them every page is assumed A4 portrait.
    pages: dto.pages?.length
      ? dto.pages.map((page) => ({
          pageNumber: toNumber(page.pageNumber, 1),
          width: toNumber(page.width, A4.width),
          height: toNumber(page.height, A4.height),
        }))
      : Array.from({ length: pageCount }, (_, index) => ({
          pageNumber: index + 1,
          ...A4,
        })),
  };
}

function fromFieldDto(dto, currentRecipientId) {
  const recipientId = dto.recipientId ?? null;
  return {
    id: dto.id,
    documentId: dto.documentId,
    recipientId,
    recipientName: dto.recipientName ?? "",
    isMine: recipientId === currentRecipientId,
    fieldType: toEnum(dto.fieldType ?? dto.type, FIELD_TYPE_BY_NUMBER, "text"),
    label: dto.label ?? "",
    pageNumber: toNumber(dto.pageNumber, 1),
    x: toNumber(dto.x),
    y: toNumber(dto.y),
    width: toNumber(dto.width),
    height: toNumber(dto.height),
    isRequired: dto.isRequired ?? true,
    value: dto.value ?? null,
    options: dto.options ?? [],
    completedAt: dto.completedAt ?? null,
  };
}

/** @returns {import("../models/signingModel").SigningSession} */
export function fromSigningSessionDto(dto, { apiBaseUrl = "" } = {}) {
  const recipient = {
    id: dto.recipient?.id,
    name: dto.recipient?.name ?? "",
    email: dto.recipient?.email ?? "",
    status: toEnum(dto.recipient?.status, RECIPIENT_STATUS_BY_NUMBER, "active"),
    recipientType: toEnum(
      dto.recipient?.recipientType,
      RECIPIENT_TYPE_BY_NUMBER,
      "signer",
    ),
    routingOrder: toNumber(dto.recipient?.routingOrder, 1),
  };

  return {
    envelopeId: dto.envelopeId,
    subject: dto.subject ?? "Untitled agreement",
    message: dto.message ?? "",
    envelopeStatus: toEnum(
      dto.envelopeStatus,
      ENVELOPE_STATUS_BY_NUMBER,
      "sent",
    ),
    expiresAt: dto.expiresAt ?? null,
    sender: { name: dto.sender?.name ?? "", email: dto.sender?.email ?? "" },
    recipient,
    remainingRecipients: toNumber(dto.remainingRecipients, 0),
    documents: [...(dto.documents ?? [])]
      .map((document) => fromDocumentDto(document, dto.envelopeId, apiBaseUrl))
      .sort((a, b) => a.order - b.order),
    fields: (dto.fields ?? []).map((field) =>
      fromFieldDto(field, recipient.id),
    ),
    savedSignatures: dto.savedSignatures ?? [],
    savedInitials: dto.savedInitials ?? [],
    stamps: dto.stamps ?? [],
  };
}

/**
 * Body for "finish signing".
 * TODO(api): confirm the submit contract (e.g. POST /api/signing/{id}/complete).
 */
export function toCompleteSigningDto(session, values) {
  return {
    recipientId: session.recipient.id,
    fields: session.fields
      .filter((field) => field.isMine && values[field.id] !== undefined)
      .map((field) => ({ fieldId: field.id, value: values[field.id] })),
  };
}
