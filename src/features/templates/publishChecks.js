import { ACCESS_ROLES } from "@/data/templateRoles";
import { pluralize } from "@/utils/formatters";
import { describeExpiry } from "./reminderSchedule";
import { getRole, rolesWithoutSignature } from "./templateSelectors";

/**
 * One check per builder step, shown in "Ready to publish".
 * Publishing is allowed only when every check passes.
 */
export function getPublishChecks(template) {
  const hasName = Boolean(template.name?.trim());

  const hasDocument = (template.documents?.length ?? 0) > 0;

  const actionableRoles = (template.roles ?? []).filter((role) =>
    [1, 2].includes(Number(role.recipientType)),
  );

  const hasRoles = actionableRoles.length > 0;

  const rolesWithFields = new Set(
    (template.fields ?? [])
      .filter((field) => field.recipientRoleId)
      .map((field) => field.recipientRoleId),
  );

  const missingFields = actionableRoles.filter(
    (role) => !rolesWithFields.has(role.id),
  );

  return [
    {
      stepId: "basic",
      label: "Basic info",
      isValid: hasName,
      summary: hasName
        ? "Template metadata is ready"
        : "Template name is required",
    },
    {
      stepId: "roles",
      label: "Roles & workflow",
      isValid: hasRoles,
      summary: hasRoles
        ? `${actionableRoles.length} signer/approver role(s)`
        : "Add at least one signer or approver",
    },
    {
      stepId: "fields",
      label: "Document & fields",
      isValid: hasDocument && missingFields.length === 0,
      summary: !hasDocument
        ? "Upload at least one document"
        : missingFields.length > 0
          ? `${missingFields.length} recipient role(s) still need a field`
          : `${template.fields?.length ?? 0} field(s) configured`,
    },
    {
      stepId: "expiry",
      label: "Expiry & reminders",
      isValid: true,
      summary: template.expirationDays
        ? `Expires after ${template.expirationDays} days`
        : "No expiry configured",
    },
  ];
}
