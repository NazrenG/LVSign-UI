import { isAutoField, isFieldComplete } from "./fieldValues";

/** Reading order: document order, page, top to bottom, left to right. */
export function sortFieldsInReadingOrder(fields, documents) {
  const docOrder = Object.fromEntries(
    documents.map((document, index) => [document.id, index]),
  );
  return [...fields].sort(
    (a, b) =>
      docOrder[a.documentId] - docOrder[b.documentId] ||
      a.pageNumber - b.pageNumber ||
      a.y - b.y ||
      a.x - b.x,
  );
}

/** The current recipient's fields in reading order. */
export const getMyFields = (session) =>
  sortFieldsInReadingOrder(
    session.fields.filter((field) => field.isMine),
    session.documents,
  );

/**
 * Progress over the current recipient's required fields only.
 * Auto-filled fields (date signed) are excluded from the counts — the
 * recipient never has to act on them.
 */
export function getSigningProgress(myFields, values) {
  const actionable = myFields.filter((field) => !isAutoField(field));
  const required = actionable.filter((field) => field.isRequired);
  const completedRequired = required.filter((field) =>
    isFieldComplete(field, values[field.id]),
  );
  const optionalRemaining = actionable.filter(
    (field) => !field.isRequired && !isFieldComplete(field, values[field.id]),
  );
  return {
    requiredCount: required.length,
    completedCount: completedRequired.length,
    remainingCount: required.length - completedRequired.length,
    optionalRemainingCount: optionalRemaining.length,
    isComplete: completedRequired.length === required.length,
  };
}

/**
 * Next required field that is still empty, starting after `fromFieldId`
 * and wrapping around. Null when everything required is done.
 */
export function findNextRequiredField(myFields, values, fromFieldId = null) {
  const pending = myFields.filter(
    (field) =>
      field.isRequired &&
      !isAutoField(field) &&
      !isFieldComplete(field, values[field.id]),
  );
  if (pending.length === 0) return null;
  const startIndex = fromFieldId
    ? myFields.findIndex((field) => field.id === fromFieldId)
    : -1;
  return (
    pending.find((field) => myFields.indexOf(field) > startIndex) ?? pending[0]
  );
}

/** Per-document completion for the navigation panel. */
export function getDocumentProgress(document, myFields, values) {
  const fields = myFields.filter(
    (field) => field.documentId === document.id && !isAutoField(field),
  );
  const required = fields.filter((field) => field.isRequired);
  const done = required.filter((field) =>
    isFieldComplete(field, values[field.id]),
  ).length;
  return {
    requiredCount: required.length,
    completedCount: done,
    isComplete: done === required.length,
    pendingPages: new Set(
      required
        .filter((field) => !isFieldComplete(field, values[field.id]))
        .map((field) => field.pageNumber),
    ),
  };
}
