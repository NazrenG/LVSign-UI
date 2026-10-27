import { AUTO_FIELD_TYPES, MARK_FIELD_TYPES } from "../models/signingModel";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Today as an ISO date ("2026-10-27") in local time. */
export function todayIso(now = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Starting values for the current recipient's fields: anything already
 * saved, plus what the system can fill in (name, email, date signed).
 */
export function getInitialValues(session, now = new Date()) {
  const values = {};
  for (const field of session.fields) {
    if (!field.isMine) continue;
    if (field.value !== null && field.value !== undefined) {
      values[field.id] = field.value;
    } else if (field.fieldType === "dateSigned") {
      values[field.id] = todayIso(now);
    } else if (field.fieldType === "fullName") {
      values[field.id] = session.recipient.name;
    } else if (field.fieldType === "email") {
      values[field.id] = session.recipient.email;
    } else if (field.fieldType === "checkbox") {
      values[field.id] = false;
    }
  }
  return values;
}

export const isMarkField = (field) =>
  MARK_FIELD_TYPES.includes(field.fieldType);
export const isAutoField = (field) =>
  AUTO_FIELD_TYPES.includes(field.fieldType);

/** Does this value count as "filled in" for this field? */
export function isFieldComplete(field, value) {
  switch (field.fieldType) {
    case "signature":
    case "initials":
    case "stamp":
      return Boolean(value?.method);
    case "checkbox":
      return value === true;
    case "number":
      return (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        Number.isFinite(Number(value))
      );
    case "email":
      return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
    case "dateSigned":
      return Boolean(value);
    default:
      return typeof value === "string" && value.trim().length > 0;
  }
}

/** Short human text for a validation problem, or null. */
export function getFieldProblem(field, value) {
  if (
    field.fieldType === "email" &&
    value &&
    !EMAIL_PATTERN.test(String(value).trim())
  )
    return "Enter a valid email address";
  if (
    field.fieldType === "number" &&
    value !== "" &&
    value != null &&
    !Number.isFinite(Number(value))
  )
    return "Enter a number";
  return null;
}
