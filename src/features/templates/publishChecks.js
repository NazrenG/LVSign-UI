import { ACCESS_ROLES } from "@/data/templateRoles";
import { pluralize } from "@/utils/formatters";
import { describeExpiry } from "./reminderSchedule";
import { getRole, rolesWithoutSignature } from "./templateSelectors";

/**
 * One check per builder step, shown in "Ready to publish".
 * Publishing is allowed only when every check passes.
 */
export function getPublishChecks(template) {
  const usedBy = ACCESS_ROLES.filter(
    (role) => template.access[role.id]?.use,
  ).length;
  const editedBy = ACCESS_ROLES.filter(
    (role) => template.access[role.id]?.edit,
  ).length;
  const missingSignature = rolesWithoutSignature(template);
  const mappedFields = template.fields.filter((field) => field.dataKey).length;

  const basicValid = Boolean(
    template.name.trim() && template.docPrefix.trim() && usedBy,
  );
  const rolesValid = template.roles.length > 0;
  const fieldsValid = missingSignature.length === 0;
  const expiryValid = template.expiry.expiresAfterDays > 0;

  return [
    {
      stepId: "basic",
      label: "Basic info",
      isValid: basicValid,
      summary: basicValid
        ? `${template.category} · used by ${pluralize(usedBy, "role")}, edited by ${editedBy}`
        : "Needs a name, a document ID prefix and at least one role that can use it",
    },
    {
      stepId: "roles",
      label: "Roles & workflow",
      isValid: rolesValid,
      summary: rolesValid
        ? [
            pluralize(template.roles.length, "signer role"),
            template.signingOrder === "sequential" ? "in order" : "all at once",
            ...(template.copyRecipients.length
              ? [`copy to ${template.copyRecipients.join(", ")}`]
              : []),
          ].join(", ")
        : "Add at least one signer role",
    },
    {
      stepId: "fields",
      label: "Fields",
      isValid: fieldsValid,
      summary: fieldsValid
        ? `${pluralize(template.fields.length, "field")}, ${mappedFields} mapped to data keys`
        : `${missingSignature.map((roleStep) => getRole(roleStep).name).join(", ")} needs a signature field`,
    },
    {
      stepId: "expiry",
      label: "Expiry & reminders",
      isValid: expiryValid,
      summary: expiryValid
        ? describeExpiry(template.expiry)
        : "Set when documents expire",
    },
  ];
}
