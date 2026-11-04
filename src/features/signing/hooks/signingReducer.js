import { SIGNING_PHASE } from "../models/signingModel";

/** Pure state for one signing session (loaded → signing → completed/declined). */
export const initialSigningState = {
  load: { status: "loading", error: null },
  session: null,
  values: {},
  activeFieldId: null,
  hasStarted: false,
  // Marks adopted once and reused for later signature/initials fields (DocuSign-style).
  adopted: { signature: null, initials: null },
  phase: SIGNING_PHASE.SIGNING,
  result: null,
  submitError: null,
  fieldSave: {
    pending: 0,
    error: null,
  },
  markSave: {
    fieldId: null,
    isSaving: false,
    error: null,
  },
};

export function signingReducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...initialSigningState };
    case "loaded":
      return {
        ...state,
        load: {
          status: "ready",
          error: null,
        },
        session: action.session,

        values: action.values,

        phase: action.terminalStatus ?? SIGNING_PHASE.SIGNING,

        loading: false,

        error: null,
      };
    case "loadFailed":
      return { ...state, load: { status: "error", error: action.error } };

    case "setValue":
      return {
        ...state,
        values: { ...state.values, [action.fieldId]: action.value },
      };
    case "applyMark":
      return {
        ...state,
        values: { ...state.values, [action.fieldId]: action.mark },
        adopted:
          action.kind === "signature" || action.kind === "initials"
            ? { ...state.adopted, [action.kind]: action.mark }
            : state.adopted,
      };
    case "clearValue": {
      const values = { ...state.values };
      delete values[action.fieldId];
      return { ...state, values };
    }

    case "focusField":
      return { ...state, activeFieldId: action.fieldId, hasStarted: true };
    case "start":
      return { ...state, hasStarted: true };

    case "submitting":
      return { ...state, phase: SIGNING_PHASE.SUBMITTING, submitError: null };
    case "submitFailed":
      return {
        ...state,
        phase: SIGNING_PHASE.SIGNING,
        submitError: action.error,
      };
    case "completed":
      return {
        ...state,
        phase: SIGNING_PHASE.COMPLETED,
        result: action.result,
      };
    case "declined":
      return { ...state, phase: SIGNING_PHASE.DECLINED, result: action.result };
    case "fieldSaveStarted":
      return {
        ...state,

        fieldSave: {
          pending: state.fieldSave.pending + 1,

          error: null,
        },
      };

    case "fieldSaveSucceeded":
      return {
        ...state,

        fieldSave: {
          ...state.fieldSave,

          pending: Math.max(0, state.fieldSave.pending - 1),
        },
      };

    case "fieldSaveFailed":
      return {
        ...state,

        fieldSave: {
          pending: Math.max(0, state.fieldSave.pending - 1),

          error: action.error,
        },
      };

    case "markSaveStarted":
      return {
        ...state,

        markSave: {
          fieldId: action.fieldId,

          isSaving: true,

          error: null,
        },
      };

    case "markSaveSucceeded":
      return {
        ...state,

        markSave: {
          fieldId: null,
          isSaving: false,
          error: null,
        },
      };

    case "markSaveFailed":
      return {
        ...state,

        markSave: {
          fieldId: action.fieldId,

          isSaving: false,

          error: action.error,
        },
      };
    default:
      throw new Error(`Unknown signing action: ${action.type}`);
  }
}
