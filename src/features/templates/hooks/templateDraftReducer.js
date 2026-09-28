import { createRoleStep } from "@/data/templates";
import { SIGNER_ROLES } from "@/data/templateRoles";
import { FIELD_TYPES } from "../templateConstants";

/**
 * Pure reducer for the template builder. Every change to a draft goes
 * through one of these actions, which keeps the step components dumb.
 */
export const DRAFT_ACTIONS = {
  UPDATE: "update", // shallow patch on the template
  UPDATE_SECTION: "updateSection", // patch on a nested object: access, rules, expiry
  ADD_ROLE: "addRole",
  UPDATE_ROLE: "updateRole",
  REMOVE_ROLE: "removeRole",
  MOVE_ROLE: "moveRole",
  ADD_FIELD: "addField",
  UPDATE_FIELD: "updateField",
  REMOVE_FIELD: "removeField",
  MARK_SAVED: "markSaved",
};

const nextUnusedRoleId = (roles) =>
  Object.keys(SIGNER_ROLES).find(
    (roleId) => !roles.some((role) => role.roleId === roleId),
  );

const move = (list, index, offset) => {
  const target = index + offset;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
};

const withTemplate = (state, template) => ({
  ...state,
  template,
  isDirty: true,
});

export function templateDraftReducer(state, action) {
  const { template } = state;

  switch (action.type) {
    case DRAFT_ACTIONS.UPDATE:
      return withTemplate(state, { ...template, ...action.patch });

    case DRAFT_ACTIONS.UPDATE_SECTION:
      return withTemplate(state, {
        ...template,
        [action.section]: { ...template[action.section], ...action.patch },
      });

    case DRAFT_ACTIONS.ADD_ROLE: {
      const roleId = nextUnusedRoleId(template.roles);
      if (!roleId) return state;
      return withTemplate(state, {
        ...template,
        roles: [...template.roles, createRoleStep(roleId)],
      });
    }

    case DRAFT_ACTIONS.UPDATE_ROLE:
      return withTemplate(state, {
        ...template,
        roles: template.roles.map((role) =>
          role.id === action.id ? { ...role, ...action.patch } : role,
        ),
      });

    case DRAFT_ACTIONS.REMOVE_ROLE:
      return withTemplate(state, {
        ...template,
        roles: template.roles.filter((role) => role.id !== action.id),
        // A removed signer's fields go with them.
        fields: template.fields.filter((field) => field.filledBy !== action.id),
      });

    case DRAFT_ACTIONS.MOVE_ROLE: {
      const index = template.roles.findIndex((role) => role.id === action.id);
      return withTemplate(state, {
        ...template,
        roles: move(template.roles, index, action.offset),
      });
    }

    case DRAFT_ACTIONS.ADD_FIELD: {
      const { fieldType, filledBy, id } = action;
      const field = {
        id,
        label: FIELD_TYPES[fieldType].label,
        type: fieldType,
        filledBy,
        required: true,
        dataKey: "",
        ...(fieldType === "dropdown" && { options: ["Option 1"] }),
      };
      return withTemplate(state, {
        ...template,
        fields: [...template.fields, field],
      });
    }

    case DRAFT_ACTIONS.UPDATE_FIELD:
      return withTemplate(state, {
        ...template,
        fields: template.fields.map((field) =>
          field.id === action.id ? { ...field, ...action.patch } : field,
        ),
      });

    case DRAFT_ACTIONS.REMOVE_FIELD:
      return withTemplate(state, {
        ...template,
        fields: template.fields.filter((field) => field.id !== action.id),
      });

    case DRAFT_ACTIONS.MARK_SAVED:
      return { ...state, isDirty: false, savedAt: action.at };

    default:
      throw new Error(`Unknown draft action: ${action.type}`);
  }
}
