import { DEFAULT_RECIPIENT_PERMISSIONS } from "../models/envelopeModel";

/**
 * The only place that knows the transport shape of an envelope.
 *
 * TODO(api): align property names with the ASP.NET Envelope DTOs once they
 * exist. Today the DTO is assumed to be the camelCase JSON that ASP.NET
 * produces by default, with the same names as the domain model. Anything the
 * server names differently is translated here — never in components.
 */

/** .NET enums often serialize as "Signer"/"Sequential"; the UI uses "signer". */
const toEnumValue = (value, fallback) =>
  typeof value === "string" && value.length
    ? value.charAt(0).toLowerCase() + value.slice(1)
    : fallback;

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

/** @returns {import("../models/envelopeModel").Envelope} */
export function fromEnvelopeDto(dto) {
  return {
    id: dto.id,
    title: dto.title ?? "",
    status: toEnumValue(dto.status, "draft"),
    routingMode: toEnumValue(dto.routingMode, "sequential"),
    sender: {
      displayName: dto.sender?.displayName ?? "",
      email: dto.sender?.email ?? "",
    },
    emailSubject: dto.emailSubject ?? "",
    emailMessage: dto.emailMessage ?? "",
    dueDate: dto.dueDate ?? null,
    reminderEveryDays: toNumber(dto.reminderEveryDays, 0),
    updatedAt: dto.updatedAt ?? null,
    documents: [...(dto.documents ?? [])]
      .sort((a, b) => toNumber(a.order) - toNumber(b.order))
      .map(fromDocumentDto),
    recipients: (dto.recipients ?? []).map(fromRecipientDto),
    fields: (dto.fields ?? []).map(fromFieldDto),
    routingRules: dto.routingRules ?? [],
  };
}

export const fromDocumentDto = (dto) => ({
  id: dto.id,
  name: dto.name ?? "Untitled document",
  fileUrl: dto.fileUrl,
  order: toNumber(dto.order, 1),
  pages: (dto.pages ?? []).map((page) => ({
    pageNumber: toNumber(page.pageNumber, 1),
    width: toNumber(page.width, 595),
    height: toNumber(page.height, 842),
  })),
});

export const fromRecipientDto = (dto) => ({
  id: dto.id,
  displayName: dto.displayName ?? "",
  email: dto.email ?? "",
  roleName: dto.roleName ?? "",
  recipientType: toEnumValue(dto.recipientType, "signer"),
  routingOrder: toNumber(dto.routingOrder, 1),
  isRequired: dto.isRequired ?? true,
  status: toEnumValue(dto.status, "created"),
  permissions: { ...DEFAULT_RECIPIENT_PERMISSIONS, ...dto.permissions },
});

export const fromFieldDto = (dto) => ({
  id: dto.id,
  documentId: dto.documentId,
  recipientId: dto.recipientId ?? null,
  type: toEnumValue(dto.type, "text"),
  label: dto.label ?? "",
  isRequired: dto.isRequired ?? true,
  options: dto.options ?? undefined,
  pageNumber: toNumber(dto.pageNumber, 1),
  // Normalized 0..1 coordinates, exactly as the backend stores them.
  x: toNumber(dto.x),
  y: toNumber(dto.y),
  width: toNumber(dto.width),
  height: toNumber(dto.height),
});

/** Domain → transport. Order is written from the array position. */
export function toEnvelopeDto(envelope) {
  return {
    id: envelope.id,
    title: envelope.title,
    status: envelope.status,
    routingMode: envelope.routingMode,
    sender: envelope.sender,
    emailSubject: envelope.emailSubject,
    emailMessage: envelope.emailMessage,
    dueDate: envelope.dueDate,
    reminderEveryDays: envelope.reminderEveryDays,
    updatedAt: envelope.updatedAt,
    documents: envelope.documents.map((document, index) => ({
      ...document,
      order: index + 1,
    })),
    recipients: envelope.recipients.map((recipient) => ({ ...recipient })),
    fields: envelope.fields.map((field) => ({ ...field })),
    routingRules: envelope.routingRules,
  };
}
