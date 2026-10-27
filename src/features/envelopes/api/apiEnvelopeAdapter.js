const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
import { readPdfPages, releasePdf } from "@/components/shared";
import { fromDocumentDto } from "../mappers/envelopeMapper";
import { InvalidDocumentError } from "./envelopeErrors";
import { FIELD_TYPES } from "../models/fieldTypes";
import { fromEnvelopeDto } from "../mappers/envelopeMapper";
import { EnvelopeNotFoundError } from "./envelopeErrors";

function createEmptyEnvelope(id, title) {
  return {
    id,
    title,
    status: "draft",
    routingMode: "sequential",

    sender: {
      displayName: "",
      email: "",
    },

    emailSubject: `Please sign: ${title}`,
    emailMessage: "",

    dueDate: null,
    reminderEveryDays: 0,

    updatedAt: new Date().toISOString(),

    documents: [],
    recipients: [],
    fields: [],
    routingRules: [],
  };
}
const ENVELOPE_STATUS_MAP = {
  1: "draft",
  2: "sent",
  3: "inProgress",
  4: "completed",
  5: "declined",
  6: "voided",
  7: "expired",
};

function mapEnvelopeStatus(status) {
  if (typeof status === "number") {
    return ENVELOPE_STATUS_MAP[status] ?? "unknown";
  }

  if (typeof status === "string") {
    return status.charAt(0).toLowerCase() + status.slice(1);
  }

  return "unknown";
}
const RECIPIENT_TYPE_TO_API = {
  signer: 1,
  approver: 2,
  viewer: 3,
  copy: 4,
};
const RECIPIENT_TYPES = {
  1: "signer",
  2: "approver",
  3: "viewer",
  4: "copy",
};

const RECIPIENT_STATUSES = {
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

const FIELD_TYPES_MAP = {
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

  // UI-da Note ayrıca yoxdur.
  12: "text",
};

const FIELD_TYPE_TO_API = {
  signature: 1,
  dateSigned: 2,
  text: 3,
  initials: 4,
  fullName: 5,
  email: 6,
  number: 7,
  checkbox: 8,
  radio: 9,
  dropdown: 10,
  stamp: 11,
};

function fromRoutingRuleDto(rule) {
  return {
    id: rule.id,

    ruleSetId: rule.ruleSetId,

    name: rule.name ?? "",

    targetRecipientId: rule.targetRecipientId,

    matchType: rule.matchType,

    priority: rule.priority ?? 1,

    isActive: rule.isActive ?? true,

    conditions: (rule.conditions ?? []).map((condition) => ({
      id: condition.id,

      sourceFieldId: condition.sourceEnvelopeFieldId,

      operator: condition.operator,

      comparisonValue: condition.comparisonValue ?? "",
    })),
  };
}

function enumValue(value, map, fallback) {
  if (typeof value === "number") {
    return map[value] ?? fallback;
  }

  if (typeof value === "string") {
    const normalized = value.charAt(0).toLowerCase() + value.slice(1);

    return normalized;
  }

  return fallback;
}

export const apiEnvelopeAdapter = {
  async createEnvelope({ title = "Untitled envelope" } = {}) {
    const response = await fetch(`${API_BASE_URL}/api/envelopes`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        subject: title,
      }),
    });

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Envelope could not be created.");
    }

    const result = await response.json();

    // Backend Guid və ya { id: Guid } qaytarsa
    // hər ikisini qəbul edirik.
    const envelopeId = typeof result === "string" ? result : result.id;

    if (!envelopeId) {
      throw new Error("Envelope id was not returned by the server.");
    }

    return createEmptyEnvelope(envelopeId, title);
  },

  async getEnvelope(envelopeId) {
    const [
      envelopeResponse,
      documentsResponse,
      recipientsResponse,
      fieldsResponse,
      routingRulesResponse,
    ] = await Promise.all([
      fetch(`${API_BASE_URL}/api/envelopes/${envelopeId}`),

      fetch(`${API_BASE_URL}/api/envelopes/${envelopeId}/documents`),

      fetch(`${API_BASE_URL}/api/envelopes/${envelopeId}/recipients`),

      fetch(`${API_BASE_URL}/api/envelopes/${envelopeId}/fields`),
      fetch(`${API_BASE_URL}/api/envelopes/${envelopeId}/routing-rules`),
    ]);

    if (envelopeResponse.status === 404) {
      throw new EnvelopeNotFoundError(envelopeId);
    }

    if (
      !envelopeResponse.ok ||
      !documentsResponse.ok ||
      !recipientsResponse.ok ||
      !fieldsResponse.ok ||
      !routingRulesResponse.ok
    ) {
      throw new Error("Envelope could not be loaded.");
    }

    const envelopeDto = await envelopeResponse.json();

    const documentDtos = await documentsResponse.json();

    const recipientDtos = await recipientsResponse.json();

    const fieldDtos = await fieldsResponse.json();
    const routingRuleDtos = await routingRulesResponse.json();

    const routingRules = routingRuleDtos.map(fromRoutingRuleDto);

    const documents = await Promise.all(
      documentDtos.map(async (document) => {
        const response = await fetch(
          `${API_BASE_URL}/api/envelopes/${envelopeId}/documents/${document.id}/content`,
        );

        if (!response.ok) {
          throw new Error(
            `Document "${document.originalFileName}" could not be loaded.`,
          );
        }

        const blob = await response.blob();

        const fileUrl = URL.createObjectURL(blob);

        const pages = await readPdfPages(fileUrl);

        return {
          id: document.id,

          name:
            document.originalFileName ??
            document.fileName ??
            "Untitled document",

          fileUrl,

          order: document.order ?? 1,

          pages,
        };
      }),
    );

    const recipients = recipientDtos.map((recipient) => ({
      id: recipient.id,

      displayName: recipient.name ?? recipient.displayName ?? "",

      email: recipient.email ?? "",

      roleName: recipient.roleName ?? "",

      recipientType: enumValue(
        recipient.recipientType,
        RECIPIENT_TYPES,
        "signer",
      ),

      routingOrder: recipient.routingOrder ?? 1,

      isRequired: recipient.isRequired ?? true,

      status: enumValue(recipient.status, RECIPIENT_STATUSES, "created"),

      permissions: {
        allowSenderEditRecipient: recipient.allowSenderEditRecipient ?? true,

        allowSenderDeleteRecipient:
          recipient.allowSenderDeleteRecipient ?? true,

        allowSenderChangeRoutingOrder:
          recipient.allowSenderChangeRoutingOrder ?? true,
      },
    }));

    const fields = fieldDtos.map((field) => {
      const type = enumValue(
        field.fieldType ?? field.type,
        FIELD_TYPES_MAP,
        "text",
      );

      return {
        id: field.id,

        documentId: field.envelopeDocumentId ?? field.documentId,

        recipientId: field.envelopeRecipientId ?? field.recipientId ?? null,

        type,

        label: FIELD_TYPES[type]?.label ?? "",

        isRequired: field.isRequired ?? true,

        pageNumber: field.pageNumber ?? 1,

        x: Number(field.x ?? 0),

        y: Number(field.y ?? 0),

        width: Number(field.width ?? 0),

        height: Number(field.height ?? 0),
        options: Array.isArray(field.options) ? field.options : undefined,
      };
    });

    const routingMode =
      recipients.length > 1 &&
      recipients.every(
        (recipient) => recipient.routingOrder === recipients[0].routingOrder,
      )
        ? "parallel"
        : "sequential";

    return fromEnvelopeDto({
      id: envelopeDto.id,

      title: envelopeDto.subject ?? envelopeDto.title ?? "Untitled envelope",

      status:mapEnvelopeStatus(envelopeDto.status),

      routingMode,

      sender: {
        displayName: envelopeDto.senderName ?? "",
        email: envelopeDto.senderEmail ?? "",
      },

      // Backend-də Subject hazırda envelope title-dır.
      emailSubject: envelopeDto.subject ?? "",

      emailMessage: envelopeDto.message ?? "",

      dueDate: envelopeDto.expiresAt
        ? envelopeDto.expiresAt.slice(0, 10)
        : envelopeDto.dueAt
          ? envelopeDto.dueAt.slice(0, 10)
          : null,

      reminderEveryDays: envelopeDto.reminderIntervalDays ?? 0,

      reminderEveryDays: envelopeDto.reminderIntervalDays ?? 0,

      updatedAt: envelopeDto.updatedAt ?? new Date().toISOString(),

      documents,

      recipients,

      fields,

      routingRules,
    });
  },

  async uploadDocument(envelopeId, file) {
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    if (!isPdf) {
      throw new InvalidDocumentError("Only PDF files can be added.");
    }

    const fileUrl = URL.createObjectURL(file);

    let pages;

    try {
      pages = await readPdfPages(fileUrl);
    } catch {
      URL.revokeObjectURL(fileUrl);
      await releasePdf(fileUrl);

      throw new InvalidDocumentError(
        `“${file.name}” could not be read as a PDF.`,
      );
    }

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/documents`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      URL.revokeObjectURL(fileUrl);
      await releasePdf(fileUrl);

      const message = await response.text();

      throw new Error(message || "Document could not be uploaded.");
    }

    const dto = await response.json();

    return fromDocumentDto({
      id: dto.id,

      name: dto.originalFileName ?? dto.fileName ?? file.name,

      fileUrl,

      order: dto.order ?? 1,

      pages,
    });
  },

  async saveDraft(envelope) {
    console.log("SAVE DRAFT REMINDER:", envelope.reminderEveryDays, envelope);
    let expiresAt = null;

    if (envelope.dueDate) {
      const date = new Date(`${envelope.dueDate}T23:59:59`);

      expiresAt = date.toISOString();
    }

    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelope.id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          subject: envelope.title.trim() || "Untitled envelope",

          message: envelope.emailMessage?.trim() || null,

          expiresAt,
          reminderIntervalDays:
            envelope.reminderEveryDays > 0 ? envelope.reminderEveryDays : null,
        }),
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Draft could not be saved.");
    }

    return {
      updatedAt: new Date().toISOString(),

      idMap: {},
    };
  },

  async sendEnvelope(envelopeId) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/send`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Envelope could not be sent.");
    }

    return {
      status: "sent",
    };
  },

  async deleteDocument(envelopeId, documentId) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/documents/${documentId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Document could not be removed.");
    }
  },

  async listUsers() {
    const response = await fetch(`${API_BASE_URL}/api/users`);

    if (!response.ok) {
      throw new Error("Users could not be loaded.");
    }

    return response.json();
  },

  async createRecipient(envelopeId, recipient) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/recipients`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: recipient.userId,

          roleName: recipient.roleName?.trim() || null,

          recipientType: RECIPIENT_TYPE_TO_API[recipient.recipientType],

          routingOrder: recipient.routingOrder,

          isRequired: recipient.isRequired,

          allowSenderEditRecipient:
            recipient.permissions.allowSenderEditRecipient,

          allowSenderDeleteRecipient:
            recipient.permissions.allowSenderDeleteRecipient,

          allowSenderChangeRoutingOrder:
            recipient.permissions.allowSenderChangeRoutingOrder,
        }),
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Recipient could not be added.");
    }

    return response.json();
  },

  async updateRecipient(envelopeId, recipientId, recipient) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/recipients/${recipientId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: recipient.userId,

          roleName: recipient.roleName?.trim() || null,

          recipientType: RECIPIENT_TYPE_TO_API[recipient.recipientType],

          routingOrder: recipient.routingOrder,

          isRequired: recipient.isRequired,

          // allowSenderEditRecipient:
          //   recipient.permissions.allowSenderEditRecipient,

          // allowSenderDeleteRecipient:
          //   recipient.permissions.allowSenderDeleteRecipient,

          // allowSenderChangeRoutingOrder:
          //   recipient.permissions.allowSenderChangeRoutingOrder,
        }),
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Recipient could not be UPDATED.");
    }
  },

  async deleteRecipient(envelopeId, recipientId) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/recipients/${recipientId}`,
      {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Recipient could not be REMOVED.");
    }
  },
  async createField(envelopeId, field) {
    if (!field.documentId) {
      throw new Error("Field document is required.");
    }

    if (!field.recipientId) {
      throw new Error("Field recipient is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/fields`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          envelopeDocumentId: field.documentId,

          envelopeRecipientId: field.recipientId,

          // FieldOwnerType.Recipient
          ownerType: 1,

          fieldType: FIELD_TYPE_TO_API[field.type],

          pageNumber: field.pageNumber,

          x: field.x,

          y: field.y,

          width: field.width,

          height: field.height,

          isRequired: field.isRequired,
          label: field.label?.trim() || null,
          options:
            field.type === "radio" || field.type === "dropdown"
              ? (field.options ?? [])
              : null,
        }),
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Field could not be created.");
    }

    return response.json();
  },
  async deleteField(envelopeId, fieldId) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/fields/${fieldId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Field could not be removed.");
    }
  },
  async updateField(envelopeId, fieldId, field) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/fields/${fieldId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          envelopeDocumentId: field.documentId,

          envelopeRecipientId: field.recipientId ?? null,

          ownerType: 1,

          fieldType: FIELD_TYPE_TO_API[field.type],

          pageNumber: field.pageNumber,

          x: field.x,

          y: field.y,

          width: field.width,

          height: field.height,

          isRequired: field.isRequired,
          label: field.label?.trim() || null,
          options:
            field.type === "radio" || field.type === "dropdown"
              ? (field.options ?? [])
              : null,
        }),
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Field could not be updated.");
    }
  },

  async reorderDocuments(envelopeId, documentIds) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/documents/order`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          documentIds,
        }),
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Document order could not be saved.");
    }
  },

  async createRoutingRule(envelopeId, rule) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/routing-rules`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: rule.name?.trim() || null,

          targetRecipientId: rule.targetRecipientId,

          matchType: 1,

          priority: rule.priority ?? 1,

          conditions: [
            {
              sourceEnvelopeFieldId: rule.sourceFieldId,

              operator: rule.operator,

              comparisonValue: rule.comparisonValue || null,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Routing condition could not be created.");
    }

    return fromRoutingRuleDto(await response.json());
  },

  async deleteRoutingRule(envelopeId, ruleId) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/routing-rules/${ruleId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Routing rule could not be deleted.");
    }
  },

  async updateRoutingRule(envelopeId, ruleId, rule) {
    const response = await fetch(
      `${API_BASE_URL}/api/envelopes/${envelopeId}/routing-rules/${ruleId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: rule.name?.trim() || null,

          targetRecipientId: rule.targetRecipientId,

          matchType: rule.matchType ?? 1,

          priority: rule.priority ?? 1,

          conditions: rule.conditions.map((condition) => ({
            sourceEnvelopeFieldId: condition.sourceFieldId,

            operator: condition.operator,

            comparisonValue: condition.comparisonValue || null,
          })),
        }),
      },
    );

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "Routing rule could not be updated.");
    }

    return fromRoutingRuleDto(await response.json());
  },
};
