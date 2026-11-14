import { useMemo, useReducer } from "react";
import { DRAFT_ACTIONS, templateDraftReducer } from "./templateDraftReducer";

let fieldCounter = 0;
const newFieldId = () =>
  `field-${Date.now().toString(36)}-${(fieldCounter += 1)}`;

/**
 * Builder state + named actions.
 * const { template, actions } = useTemplateDraft(initialTemplate);
 * actions.updateRole(id, { action: "acknowledge" });
 */
export function useTemplateDraft(initialTemplate) {
  const [state, dispatch] = useReducer(templateDraftReducer, {
    template: initialTemplate,
    isDirty: false,
    savedAt: null,
  });

  const actions = useMemo(
    () => ({
      update: (patch) => dispatch({ type: DRAFT_ACTIONS.UPDATE, patch }),
      updateSection: (section, patch) =>
        dispatch({ type: DRAFT_ACTIONS.UPDATE_SECTION, section, patch }),
      setRoles: (roles) =>
        dispatch({
          type: DRAFT_ACTIONS.SET_ROLES,
          roles,
        }),

      addExistingRole: (role) =>
        dispatch({
          type: DRAFT_ACTIONS.ADD_EXISTING_ROLE,
          role,
        }),
      updateRole: (id, patch) =>
        dispatch({ type: DRAFT_ACTIONS.UPDATE_ROLE, id, patch }),
      removeRole: (id) => dispatch({ type: DRAFT_ACTIONS.REMOVE_ROLE, id }),
      moveRole: (id, offset) =>
        dispatch({ type: DRAFT_ACTIONS.MOVE_ROLE, id, offset }),

      /** Returns the new field's id so the caller can select it. */
      addField: (fieldType, filledBy) => {
        const id = newFieldId();
        dispatch({ type: DRAFT_ACTIONS.ADD_FIELD, fieldType, filledBy, id });
        return id;
      },
      updateField: (id, patch) =>
        dispatch({ type: DRAFT_ACTIONS.UPDATE_FIELD, id, patch }),
      removeField: (id) => dispatch({ type: DRAFT_ACTIONS.REMOVE_FIELD, id }),

      markSaved: () =>
        dispatch({ type: DRAFT_ACTIONS.MARK_SAVED, at: new Date() }),
      addDocument: (document) =>
        dispatch({
          type: DRAFT_ACTIONS.ADD_DOCUMENT,
          document,
        }),
      addExistingField: (field) =>
        dispatch({
          type: DRAFT_ACTIONS.ADD_EXISTING_FIELD,
          field,
        }),
    }),
    [],
  );

  return { ...state, actions };
}
