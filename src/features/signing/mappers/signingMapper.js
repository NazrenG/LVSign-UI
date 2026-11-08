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
  10: "waitingForCondition",
  11: "sent",
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

const APPLIED_MARK_KIND = {
  signature: 1,
  initials: 2,
  stamp: 3,
};
const SIGNATURE_KIND = {
  signature: 1,
  initials: 2,
};

const SIGNATURE_TYPE = {
  drawn: 1,
  typed: 2,
};
function resolveApiUrl(url, apiBaseUrl) {
  if (!url) {
    return null;
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}
export function toCreateSignatureRequest(fieldType, mark) {
  const kind = SIGNATURE_KIND[fieldType];

  if (!kind) {
    throw new Error(
      "Only signature and initials can create a signature asset.",
    );
  }

  if (mark?.method === "typed") {
    return {
      kind,
      type: SIGNATURE_TYPE.typed,
      typedText: mark.typedText,
      fontKey: mark.fontKey ?? null,
      imageDataUrl: null,
    };
  }

  if (mark?.method === "drawn") {
    return {
      kind,
      type: SIGNATURE_TYPE.drawn,
      typedText: null,
      fontKey: null,
      imageDataUrl: mark.imageDataUrl,
    };
  }

  throw new Error("This mark does not require a new signature asset.");
}
export function toApplyMarkRequest(fieldType, mark) {
  const kind = APPLIED_MARK_KIND[fieldType];

  if (!kind) {
    throw new Error("Unsupported signing mark type.");
  }

  if (fieldType === "stamp") {
    if (!mark?.sourceId) {
      throw new Error("Please select a saved stamp.");
    }

    return {
      kind,
      sourceSignatureId: null,
      sourceStampId: mark.sourceId,
    };
  }

  if (!mark?.sourceId) {
    throw new Error(
      "Typed and drawn signatures are not available yet. Please use a saved signature.",
    );
  }

  return {
    kind,
    sourceSignatureId: mark.sourceId,
    sourceStampId: null,
  };
}
function fromSavedSignatureDto(dto, apiBaseUrl) {
  const contentUrl = resolveApiUrl(dto.contentUrl ?? dto.imageUrl, apiBaseUrl);

  return {
    id: dto.id,

    label: dto.label ?? "Saved signature",

    typedText: dto.typedText ?? "",

    fontKey: dto.fontKey ?? undefined,

    contentUrl,

    imageDataUrl: contentUrl,
  };
}

function fromStampDto(dto, apiBaseUrl) {
  const imageUrl = resolveApiUrl(dto.contentUrl ?? dto.imageUrl, apiBaseUrl);

  return {
    id: dto.id,

    name: dto.name ?? "Stamp",

    imageUrl,

    imageDataUrl: imageUrl,
  };
}
function fromAppliedSignatureDto(
  dto,
  fieldType,
  sources = {
    savedSignatures: [],
    savedInitials: [],
    stamps: [],
  },
) {
  if (!dto) {
    return null;
  }

  if (fieldType === "stamp") {
    const stamp = sources.stamps.find((item) => item.id === dto.sourceStampId);

    return {
      ...(stamp ?? {}),

      method: "stamp",

      sourceId: dto.sourceStampId,

      imageDataUrl: stamp?.imageDataUrl ?? stamp?.imageUrl ?? null,

      appliedAt: dto.appliedAt,
    };
  }

  /*
   * Typed signature/initial:
   * immutable snapshot DTO-dan bərpa olunur.
   */
  const signatureType =
    typeof dto.signatureTypeSnapshot === "string"
      ? dto.signatureTypeSnapshot.charAt(0).toLowerCase() +
        dto.signatureTypeSnapshot.slice(1)
      : dto.signatureTypeSnapshot === 2
        ? "typed"
        : dto.signatureTypeSnapshot === 1
          ? "drawn"
          : null;

  if (signatureType === "typed" && dto.typedTextSnapshot) {
    return {
      method: "typed",

      sourceId: dto.sourceSignatureId,

      typedText: dto.typedTextSnapshot,

      fontKey: dto.fontKeySnapshot ?? "great-vibes",

      appliedAt: dto.appliedAt,
    };
  }

  /*
   * Drawn/saved image signature.
   */
  const sourceList =
    fieldType === "initials" ? sources.savedInitials : sources.savedSignatures;

  const signature = sourceList.find(
    (item) => item.id === dto.sourceSignatureId,
  );

  return {
    ...(signature ?? {}),

    method: signatureType === "drawn" ? "drawn" : "saved",

    sourceId: dto.sourceSignatureId,

    imageDataUrl: signature?.imageDataUrl ?? signature?.contentUrl ?? null,

    appliedAt: dto.appliedAt,
  };
}

const MARK_FIELD_TYPES = ["signature", "initials", "stamp"];
/** "Completed" / 4 / "completed" → "completed" */
function toEnum(value, byNumber, fallback) {
  if (typeof value === "number") return byNumber[value] ?? fallback;
  if (typeof value === "string" && value.length) {
    return value.charAt(0).toLowerCase() + value.slice(1);
  }
  return fallback;
}

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
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

function fromFieldDto(dto, currentRecipientId, sources) {
  /*
   * Signing session backend yalnız current
   * recipient-in field-lərini qaytarır.
   *
   * Ona görə DTO-da recipientId gəlməsə belə,
   * həmin field current recipient-ə aiddir.
   */
  const fieldType = toEnum(
    dto.fieldType ?? dto.type,
    FIELD_TYPE_BY_NUMBER,
    "text",
  );

  const isMarkField = ["signature", "initials", "stamp"].includes(fieldType);
  const recipientId = dto.recipientId ?? currentRecipientId;

  const value = isMarkField
    ? fromAppliedSignatureDto(dto.appliedSignature, fieldType, sources)
    : fromFieldValueDto(dto.fieldValue, fieldType);

  return {
    id: dto.id,
    documentId: dto.documentId ?? dto.envelopeDocumentId,
    recipientId,
    recipientName: dto.recipientName ?? "",
    isMine: recipientId === currentRecipientId,
    fieldType,
    label: dto.label ?? "",
    pageNumber: toNumber(dto.pageNumber, 1),
    x: toNumber(dto.x),
    y: toNumber(dto.y),
    width: toNumber(dto.width),
    height: toNumber(dto.height),
    isRequired: dto.isRequired ?? true,
    value,
    options: Array.isArray(dto.options) ? dto.options : [],
    completedAt:
      dto.fieldValue?.filledAt ?? dto.appliedSignature?.appliedAt ?? null,
  };
}

function fromFieldValueDto(fieldValue, fieldType) {
  if (!fieldValue) {
    return null;
  }

  switch (fieldType) {
    case "number":
      return fieldValue.valueNumber ?? null;

    case "dateSigned":
      return fieldValue.valueDate ?? null;

    case "checkbox":
      return fieldValue.valueBoolean ?? false;

    case "text":
    case "fullName":
    case "email":
    case "radio":
    case "dropdown":
      return fieldValue.valueText ?? null;

    default:
      return fieldValue.valueText ?? null;
  }
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

  const savedSignatures = (dto.savedSignatures ?? []).map((item) =>
    fromSavedSignatureDto(item, apiBaseUrl),
  );

  const savedInitials = (dto.savedInitials ?? []).map((item) =>
    fromSavedSignatureDto(item, apiBaseUrl),
  );
  const stamps = (dto.stamps ?? []).map((item) =>
    fromStampDto(item, apiBaseUrl),
  );
  const sources = {
    savedSignatures,
    savedInitials,
    stamps,
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
      fromFieldDto(field, recipient.id, sources),
    ),
    savedSignatures: savedSignatures ?? [],
    savedInitials: savedInitials ?? [],
    stamps: stamps ?? [],
    fields: (dto.fields ?? []).map((field) =>
      fromFieldDto(field, recipient.id, sources),
    ),
  };
}

export function toCompleteSigningDto(session, values) {
  return {
    recipientId: session.recipient.id,
    fields: session.fields
      .filter((field) => field.isMine && values[field.id] !== undefined)
      .map((field) => ({ fieldId: field.id, value: values[field.id] })),
  };
}

export function toSigningFieldValueRequest(field, value) {
  switch (field.fieldType) {
    case "text":
    case "fullName":
    case "email":
    case "radio":
    case "dropdown":
      return {
        valueText: value === null || value === undefined ? null : String(value),
      };

    case "number": {
      if (value === "" || value === null || value === undefined) {
        return {
          valueNumber: null,
        };
      }

      const number = Number(value);

      if (!Number.isFinite(number)) {
        return null;
      }

      return {
        valueNumber: number,
      };
    }

    case "dateSigned":
      return {
        valueDate: value || null,
      };

    case "checkbox":
      return {
        valueBoolean: Boolean(value),
      };

    default:
      return null;
  }
}
