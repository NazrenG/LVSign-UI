import { useCallback, useEffect, useMemo, useReducer } from "react";
import { signingRepository } from "../api/signingRepository";
import { getSigningAccess } from "../utils/signingAccess";
import { getInitialValues } from "../utils/fieldValues";
import {
  findNextRequiredField,
  getMyFields,
  getSigningProgress,
} from "../utils/signingProgress";
import { initialSigningState, signingReducer } from "./signingReducer";

/**
 * Everything the signing screen needs: load the session, track values,
 * guide through required fields, finish or decline.
 * Talks only to signingRepository, so swapping the dev adapter for the API
 * changes nothing here.
 */
export function useSigningSession(envelopeId) {
  const [state, dispatch] = useReducer(signingReducer, initialSigningState);
  const { session, values, activeFieldId } = state;

  useEffect(() => {
    let isCurrent = true;
    dispatch({ type: "loading" });
    signingRepository
      .getSession(envelopeId)
      .then((loaded) => {
        if (isCurrent)
          dispatch({
            type: "loaded",
            session: loaded,
            values: getInitialValues(loaded),
          });
      })
      .catch((error) => {
        if (isCurrent) dispatch({ type: "loadFailed", error });
      });
    return () => {
      isCurrent = false;
    };
  }, [envelopeId]);

  const access = useMemo(
    () => (session ? getSigningAccess(session) : null),
    [session],
  );
  const myFields = useMemo(
    () => (session ? getMyFields(session) : []),
    [session],
  );
  const progress = useMemo(
    () => getSigningProgress(myFields, values),
    [myFields, values],
  );
  const nextRequiredField = useMemo(
    () => findNextRequiredField(myFields, values, activeFieldId),
    [myFields, values, activeFieldId],
  );

  const actions = useMemo(
    () => ({
      setValue: (fieldId, value) =>
        dispatch({ type: "setValue", fieldId, value }),
      applyMark: (fieldId, kind, mark) =>
        dispatch({ type: "applyMark", fieldId, kind, mark }),
      clearValue: (fieldId) => dispatch({ type: "clearValue", fieldId }),
      focusField: (fieldId) => dispatch({ type: "focusField", fieldId }),
      start: () => dispatch({ type: "start" }),
    }),
    [],
  );

  const finish = useCallback(async () => {
    dispatch({ type: "submitting" });
    try {
      const result = await signingRepository.completeSigning(session, values);
      dispatch({ type: "completed", result });
    } catch (error) {
      dispatch({ type: "submitFailed", error });
    }
  }, [session, values]);

  const decline = useCallback(
    async (reason) => {
      const result = await signingRepository.declineSigning(session, reason);
      dispatch({ type: "declined", result });
    },
    [session],
  );

  return {
    ...state,
    access,
    myFields,
    progress,
    nextRequiredField,
    actions,
    finish,
    decline,
  };
}
