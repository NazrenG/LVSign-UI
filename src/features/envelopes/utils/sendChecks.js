import { FIELD_TYPES, isFieldAllowedFor } from "../models/fieldTypes";
import { RECIPIENT_TYPES } from "../models/recipientTypes";
import { pluralize } from "@/utils/formatters";
import { isRectWithinPage } from "./coordinates";
import { getDocument, getRecipient } from "./envelopeSelectors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Ready to send" checklist. Presentation-level validation only — it helps
 * the sender before they press Send; the server re-validates everything.
 *
 * Returns [{ id, label, isValid, summary, issues: [{ message, fieldId?, recipientId? }] }]
 */
export function getSendChecks(envelope) {
  return [
    checkDocuments(envelope),
    checkRecipients(envelope),
    checkFields(envelope),
  ];
}

export const isReadyToSend = (checks) => checks.every((check) => check.isValid);

function checkDocuments({ documents }) {
  const isValid = documents.length > 0;
  return {
    id: "documents",
    label: "Documents",
    isValid,
    summary: isValid
      ? `${pluralize(documents.length, "document")}, ${pluralize(
          documents.reduce((sum, document) => sum + document.pages.length, 0),
          "page",
        )}`
      : "Add at least one document",
    issues: isValid ? [] : [{ message: "Add at least one document" }],
  };
}

function checkRecipients({ recipients }) {
  const issues = [];
  const signers = recipients.filter(
    (recipient) => RECIPIENT_TYPES[recipient.recipientType].canOwnFields,
  );

  if (signers.length === 0)
    issues.push({ message: "Add at least one signer or approver" });

  recipients.forEach((recipient) => {
    const name = recipient.displayName.trim() || "A recipient";
    if (!recipient.displayName.trim())
      issues.push({
        message: "A recipient has no name",
        recipientId: recipient.id,
      });
    if (!EMAIL_PATTERN.test(recipient.email.trim()))
      issues.push({
        message: `${name} needs a valid email address`,
        recipientId: recipient.id,
      });
  });

  return {
    id: "recipients",
    label: "Recipients",
    isValid: issues.length === 0,
    summary:
      issues.length === 0
        ? `${pluralize(recipients.length, "recipient")}, ${pluralize(signers.length, "signing recipient")}`
        : issues[0].message,
    issues,
  };
}

function checkFields(envelope) {
  const issues = [];
  if (envelope.fields.length === 0)
    issues.push({ message: "Place at least one field" });

  envelope.fields.forEach((field) => {
    const typeLabel = FIELD_TYPES[field.type].label;
    const recipient = getRecipient(envelope, field.recipientId);
    const document = getDocument(envelope, field.documentId);

    if (!recipient) {
      issues.push({
        message: `${typeLabel} field has no recipient`,
        fieldId: field.id,
      });
    } else if (!isFieldAllowedFor(field.type, recipient.recipientType)) {
      issues.push({
        message: `${typeLabel} can’t be assigned to ${recipient.displayName} (${RECIPIENT_TYPES[recipient.recipientType].label.toLowerCase()})`,
        fieldId: field.id,
      });
    }
    if (
      !document ||
      field.pageNumber < 1 ||
      field.pageNumber > document.pages.length
    ) {
      issues.push({
        message: `${typeLabel} field is on a page that doesn’t exist`,
        fieldId: field.id,
      });
    } else if (!isRectWithinPage(field)) {
      issues.push({
        message: `${typeLabel} field goes past the page edge`,
        fieldId: field.id,
      });
    }
    if (
      FIELD_TYPES[field.type].hasOptions &&
      (field.options ?? []).filter(Boolean).length < 2
    ) {
      issues.push({
        message: `${typeLabel} needs at least two options`,
        fieldId: field.id,
      });
    }
  });

  envelope.recipients
    .filter(
      (recipient) => RECIPIENT_TYPES[recipient.recipientType].needsSignature,
    )
    .forEach((recipient) => {
      const hasSignature = envelope.fields.some(
        (field) =>
          field.recipientId === recipient.id && field.type === "signature",
      );
      if (!hasSignature)
        issues.push({
          message: `${recipient.displayName || "A signer"} has no signature field`,
          recipientId: recipient.id,
        });
    });

  return {
    id: "fields",
    label: "Fields",
    isValid: issues.length === 0,
    summary:
      issues.length === 0
        ? `${pluralize(envelope.fields.length, "field")} placed, every signer has a signature`
        : issues.length === 1
          ? issues[0].message
          : `${issues.length} things to fix`,
    issues,
  };
}
