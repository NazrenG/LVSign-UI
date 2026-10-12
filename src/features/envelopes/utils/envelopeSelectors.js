import { ROUTING_MODE } from "../models/envelopeModel";
import { RECIPIENT_TYPES } from "../models/recipientTypes";

export const getDocument = (envelope, documentId) =>
  envelope.documents.find((document) => document.id === documentId);

export const getRecipient = (envelope, recipientId) =>
  envelope.recipients.find((recipient) => recipient.id === recipientId);

export const getField = (envelope, fieldId) =>
  envelope.fields.find((field) => field.id === fieldId);

export const getFieldsOnPage = (envelope, documentId, pageNumber) =>
  envelope.fields.filter(
    (field) =>
      field.documentId === documentId && field.pageNumber === pageNumber,
  );

export const countFieldsByRecipient = (envelope) =>
  envelope.fields.reduce((counts, field) => {
    const key = field.recipientId ?? "unassigned";
    return { ...counts, [key]: (counts[key] ?? 0) + 1 };
  }, {});

export const countFieldsByDocument = (envelope) =>
  envelope.fields.reduce(
    (counts, field) => ({
      ...counts,
      [field.documentId]: (counts[field.documentId] ?? 0) + 1,
    }),
    {},
  );

/** Recipients who can be given fields (signers and approvers). */
export const getFieldOwners = (envelope) =>
  envelope.recipients.filter(
    (recipient) => RECIPIENT_TYPES[recipient.recipientType].canOwnFields,
  );

/** Recipients sorted by routing order (stable for equal orders). */
export const sortByRoutingOrder = (recipients) =>
  [...recipients].sort((a, b) => a.routingOrder - b.routingOrder);

/**
 * Routing steps: recipients grouped by routing order.
 * [{ order: 1, recipients: [...] }, { order: 2, recipients: [...] }]
 * Equal orders sign in parallel within a step.
 */
export function getRoutingSteps(envelope) {
  const steps = new Map();
  sortByRoutingOrder(envelope.recipients).forEach((recipient) => {
    const order =
      envelope.routingMode === ROUTING_MODE.PARALLEL
        ? 1
        : recipient.routingOrder;
    if (!steps.has(order)) steps.set(order, []);
    steps.get(order).push(recipient);
  });
  return [...steps.entries()].map(([order, recipients]) => ({
    order,
    recipients,
  }));
}

/** Next routing order for a newly added recipient. */
export const nextRoutingOrder = (recipients) =>
  recipients.reduce(
    (max, recipient) => Math.max(max, recipient.routingOrder),
    0,
  ) + 1;

/** Re-numbers routing orders 1..n in the given order (sequential routing). */
export const renumberRoutingOrder = (recipients) =>
  recipients.map((recipient, index) => ({
    ...recipient,
    routingOrder: index + 1,
  }));
