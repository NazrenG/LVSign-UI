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
};

export function signingReducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...initialSigningState };
    case "loaded":
      return {
        ...state,
        load: { status: "ready", error: null },
        session: action.session,
        values: action.values,
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

    default:
      throw new Error(`Unknown signing action: ${action.type}`);
  }
}
