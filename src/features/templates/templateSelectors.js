import { PEOPLE } from "@/data/people";
import { ACCESS_ROLES, SIGNER_ROLES } from "@/data/templateRoles";
import { pluralize } from "@/utils/formatters";
import { FIELD_TYPES, FILLER, FILLER_LABELS } from "./templateConstants";

/* ---------- roles ---------- */

export const getRole = (roleStep) => SIGNER_ROLES[roleStep.roleId];

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th"];

/** "1st approver" / "2nd approver" / "Final signer" */
export function getStepLabel(index, total) {
  if (total > 1 && index === total - 1) return "Final signer";
  return `${ORDINALS[index] ?? `${index + 1}th`} approver`;
}

/** Items for <RoleChain />: (DH)─(HR)─(EM)─□ */
export const getRoleChainItems = (template) =>
  template.roles.map((roleStep) => {
    const role = getRole(roleStep);
    return {
      key: roleStep.id,
      name: role.name,
      initials: role.code,
      variant: "outline",
    };
  });

/** Steps for <StepProgress /> in the approval chain card. */
export const getApprovalSteps = (template) =>
  template.roles.map((roleStep, index) => ({
    key: roleStep.id,
    label: getRole(roleStep).name,
    caption: getStepLabel(index, template.roles.length),
    state: "pending",
  }));

/** "3 working days · can delegate · acknowledges" */
export function describeRoleStep(roleStep) {
  const parts = [`${pluralize(roleStep.timeToActDays, "working day")}`];
  if (roleStep.delegate !== "No") parts.push("can delegate");
  if (roleStep.action === "acknowledge") parts.push("acknowledges");
  return parts.join(" · ");
}

/* ---------- fields ---------- */

/** "Sender", "HR system", "Calculated" or the signer role's name. */
export function getFillerLabel(filledBy, template) {
  if (FILLER_LABELS[filledBy]) return FILLER_LABELS[filledBy];
  const roleStep = template.roles.find((role) => role.id === filledBy);
  return roleStep ? getRole(roleStep).name : filledBy;
}

export const isSigningField = (field) => FIELD_TYPES[field.type]?.signing;

/** Fields the sender deals with before sending (typed, pre-filled or calculated). */
export const getSenderSideFields = (template) =>
  template.fields.filter((field) => !isSigningField(field));

/** Signature-type fields of one signer role. */
export const getRoleFields = (template, roleId) =>
  template.fields.filter(
    (field) => isSigningField(field) && field.filledBy === roleId,
  );

/**
 * Rows for the read-only "Form fields" table. A role's signature and
 * date-signed fields are shown as one "Signature + date" row.
 */
export function getFieldTableRows(template) {
  const rows = getSenderSideFields(template).map((field) => ({
    key: field.id,
    label: field.label,
    type: FIELD_TYPES[field.type].label,
    filledBy: getFillerLabel(field.filledBy, template),
    required: field.required,
    dataKey: field.dataKey,
  }));

  template.roles.forEach((roleStep) => {
    const fields = getRoleFields(template, roleStep.id);
    if (fields.length === 0) return;
    const hasDate = fields.some((field) => field.type === "dateSigned");
    const main =
      fields.find((field) => field.type !== "dateSigned") ?? fields[0];
    const typeLabel = FIELD_TYPES[main.type].label;
    rows.push({
      key: roleStep.id,
      label:
        hasDate && main.type !== "dateSigned"
          ? `${typeLabel} + date`
          : typeLabel,
      type: typeLabel,
      filledBy: getRole(roleStep).name,
      required: fields.some((field) => field.required),
      dataKey: main.dataKey,
    });
  });

  return rows;
}

/** Fields on the sender's side: typed by them or calculated from their input. */
export const countSenderFilled = (template) =>
  template.fields.filter((field) =>
    [FILLER.SENDER, FILLER.CALCULATED].includes(field.filledBy),
  ).length;

/**
 * Fields grouped for the builder's left column:
 * Sender · Pre-filled from HR system · one group per signer role.
 */
export function getFieldGroups(template) {
  const byFiller = (fillers) =>
    template.fields.filter((field) => fillers.includes(field.filledBy));

  return [
    {
      key: "sender",
      title: "Sender",
      fields: byFiller([FILLER.SENDER, FILLER.CALCULATED]),
    },
    {
      key: "hrSystem",
      title: "Pre-filled from HR system",
      fields: byFiller([FILLER.HR_SYSTEM]),
    },
    ...template.roles.map((roleStep) => ({
      key: roleStep.id,
      title: getRole(roleStep).name,
      fields: byFiller([roleStep.id]),
    })),
  ].filter((group) => group.fields.length > 0);
}

export const rolesWithoutSignature = (template) =>
  template.roles.filter(
    (roleStep) =>
      !getRoleFields(template, roleStep.id).some(
        (field) => field.type === "signature",
      ),
  );

/* ---------- access ---------- */

const namesWith = (access, permission) =>
  ACCESS_ROLES.filter((role) => access[role.id]?.[permission]).map(
    (role) => role.name,
  );

export function getAudience(access) {
  const canUse = namesWith(access, "use");
  const total = ACCESS_ROLES.reduce((sum, role) => sum + role.people, 0);
  const reached = ACCESS_ROLES.filter((role) => access[role.id]?.use).reduce(
    (sum, role) => sum + role.people,
    0,
  );
  return {
    canUse,
    canEdit: namesWith(access, "edit"),
    people: `${reached} of ${total}`,
  };
}

/* ---------- people (for the pre-fill form) ---------- */

export const findPersonByName = (name) =>
  Object.values(PEOPLE).find(
    (person) => person.name.toLowerCase() === name.trim().toLowerCase(),
  );

/* ---------- list page ---------- */

export function countByCategory(templates) {
  return templates.reduce(
    (counts, template) => ({
      ...counts,
      [template.category]: (counts[template.category] ?? 0) + 1,
    }),
    { all: templates.length },
  );
}

const SORTERS = {
  mostUsed: (a, b) => b.stats.usesThisMonth - a.stats.usesThisMonth,
  recent: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  name: (a, b) => a.name.localeCompare(b.name),
};

/** Search matches the name, description, category and signer role names. */
export function filterTemplates(templates, { category = "all", query = "" }) {
  const needle = query.trim().toLowerCase();
  return templates.filter((template) => {
    if (template.hidden) return false;
    if (category !== "all" && template.category !== category) return false;
    if (!needle) return true;
    const haystack = [
      template.name,
      template.description,
      template.category,
      ...template.roles.map((roleStep) => getRole(roleStep).name),
      ...template.fields.map((field) => field.label),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export const sortTemplates = (templates, sortKey) =>
  [...templates].sort(SORTERS[sortKey] ?? SORTERS.mostUsed);

export const getFrequentlyUsed = (templates, limit = 4) =>
  sortTemplates(templates, "mostUsed").slice(0, limit);
