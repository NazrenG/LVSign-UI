import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { signingRepository } from "../api/signingRepository";
import { getSigningAccess } from "../utils/signingAccess";
import { getInitialValues } from "../utils/fieldValues";
import {
  findNextRequiredField,
  getMyFields,
  getSigningProgress,
} from "../utils/signingProgress";
import { initialSigningState, signingReducer } from "./signingReducer";
import { toast } from "sonner";

/**
 * Everything the signing screen needs: load the session, track values,
 * guide through required fields, finish or decline.
 * Talks only to signingRepository, so swapping the dev adapter for the API
 * changes nothing here.
 */
export function useSigningSession(envelopeId) {
  const submitInFlightRef = useRef(false);
  const saveTimersRef = useRef(new Map());
  const markInFlightRef = useRef(new Set());
  const fieldSavePromisesRef = useRef(new Set());
  const activeEnvelopeRef = useRef(envelopeId);
  const [state, dispatch] = useReducer(signingReducer, initialSigningState);
  const { session, values, activeFieldId } = state;

  useEffect(() => {
    activeEnvelopeRef.current = envelopeId;
  }, [envelopeId]);

  useEffect(() => {
    let isCurrent = true;
    dispatch({ type: "loading" });
    console.log("SIGNING: getSession started", envelopeId);

    signingRepository
      .getSession(envelopeId)
      .then((loaded) => {
        console.log("SIGNING: getSession completed", loaded);

        if (!isCurrent) {
          return;
        }

        const recipientStatus = loaded.recipient?.status;

        const envelopeStatus = loaded.envelopeStatus;

        let terminalStatus = null;

        if (recipientStatus === "completed" || envelopeStatus === "completed") {
          terminalStatus = "completed";
        } else if (
          recipientStatus === "declined" ||
          envelopeStatus === "declined"
        ) {
          terminalStatus = "declined";
        } else if (envelopeStatus === "voided") {
          terminalStatus = "voided";
        } else if (envelopeStatus === "expired") {
          terminalStatus = "expired";
        }

        dispatch({
          type: "loaded",
          session: loaded,
          values: getInitialValues(loaded),
          terminalStatus,
        });
      })
      .catch((error) => {
        console.error("SIGNING: getSession failed", error);

        if (isCurrent) {
          dispatch({
            type: "loadFailed",
            error,
          });
        }
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

  const persistFieldValue = useCallback(
    async (field, value) => {
      if (!session) {
        return false;
      }

      const targetEnvelopeId = session.envelopeId;

      dispatch({
        type: "fieldSaveStarted",
      });

      const savePromise = signingRepository.saveFieldValue(
        targetEnvelopeId,
        field,
        value,
      );

      fieldSavePromisesRef.current.add(savePromise);

      try {
        await savePromise;

        if (activeEnvelopeRef.current !== targetEnvelopeId) {
          return true;
        }

        dispatch({
          type: "fieldSaveSucceeded",
        });

        return true;
      } catch (error) {
        if (activeEnvelopeRef.current !== targetEnvelopeId) {
          return false;
        }

        dispatch({
          type: "fieldSaveFailed",
          error,
        });

        toast.error(
          error instanceof Error
            ? error.message
            : "The field value could not be saved.",
        );

        return false;
      } finally {
        fieldSavePromisesRef.current.delete(savePromise);
      }
    },
    [session],
  );
  useEffect(() => {
    return () => {
      for (const entry of saveTimersRef.current.values()) {
        clearTimeout(entry.timer);
      }

      saveTimersRef.current.clear();

      markInFlightRef.current.clear();

      submitInFlightRef.current = false;
    };
  }, [envelopeId]);
  const scheduleFieldSave = useCallback(
    (field, value) => {
      if (!field) {
        return;
      }

      if (["signature", "initials", "stamp"].includes(field.fieldType)) {
        return;
      }

      const previous = saveTimersRef.current.get(field.id);

      if (previous?.timer) {
        clearTimeout(previous.timer);
      }

      const shouldDebounce = ["text", "number", "fullName", "email"].includes(
        field.fieldType,
      );

      if (!shouldDebounce) {
        saveTimersRef.current.delete(field.id);

        void persistFieldValue(field, value);

        return;
      }

      const timer = setTimeout(() => {
        saveTimersRef.current.delete(field.id);

        void persistFieldValue(field, value);
      }, 500);

      saveTimersRef.current.set(field.id, {
        timer,
        field,
        value,
      });
    },
    [persistFieldValue],
  );


  const removeMark = useCallback(
    async (fieldId) => {
      if (!session) {
        return false;
      }

      /*
       * Same field üçün artıq mutation gedirsə
       * ikinci request göndərmirik.
       */
      if (markInFlightRef.current.has(fieldId)) {
        return false;
      }

      const field = session.fields.find((item) => item.id === fieldId);

      markInFlightRef.current.add(fieldId);

      dispatch({
        type: "markSaveStarted",
        fieldId,
      });

      try {
        await signingRepository.removeMark(session.envelopeId, fieldId);

        dispatch({
          type: "clearValue",
          fieldId,
        });

        dispatch({
          type: "markSaveSucceeded",
        });

        const label =
          field?.fieldType === "initials"
            ? "Initials"
            : field?.fieldType === "stamp"
              ? "Stamp"
              : "Signature";

        toast.success(`${label} removed successfully.`);

        return true;
      } catch (error) {
        dispatch({
          type: "markSaveFailed",
          fieldId,
          error,
        });

        toast.error(
          error instanceof Error
            ? error.message
            : "The mark could not be removed.",
        );

        return false;
      } finally {
        markInFlightRef.current.delete(fieldId);
      }
    },
    [session],
  );

  const applyMark = useCallback(
    async (fieldId, kind, mark) => {
      if (!session) {
        return false;
      }

      /*
       * Double-click və ya modal-dan
       * ardıcıl iki Apply request-i bloklayırıq.
       */
      if (markInFlightRef.current.has(fieldId)) {
        return false;
      }

      const field = session.fields.find((item) => item.id === fieldId);

      if (!field) {
        return false;
      }

      markInFlightRef.current.add(fieldId);

      dispatch({
        type: "markSaveStarted",
        fieldId,
      });

      try {
        const result = await signingRepository.applyMark(
          session.envelopeId,
          field,
          mark,
        );

        const persistedMark = {
          ...mark,

          sourceId: result.sourceId ?? mark.sourceId,

          contentUrl: result.contentUrl ?? mark.contentUrl,

          appliedSignatureId: result.id,

          appliedAt: result.appliedAt,
        };

        dispatch({
          type: "applyMark",
          fieldId,
          kind,
          mark: persistedMark,
        });

        dispatch({
          type: "markSaveSucceeded",
        });

        const label =
          field.fieldType === "initials"
            ? "Initials"
            : field.fieldType === "stamp"
              ? "Stamp"
              : "Signature";

        toast.success(`${label} applied successfully.`);

        return true;
      } catch (error) {
        dispatch({
          type: "markSaveFailed",
          fieldId,
          error,
        });

        toast.error(
          error instanceof Error
            ? error.message
            : "The mark could not be applied.",
        );

        return false;
      } finally {
        markInFlightRef.current.delete(fieldId);
      }
    },
    [session],
  );
  const actions = useMemo(
    () => ({
      setValue: (fieldId, value) => {
        dispatch({
          type: "setValue",
          fieldId,
          value,
        });

        const field = session?.fields.find((item) => item.id === fieldId);

        if (field) {
          scheduleFieldSave(field, value);
        }
      },

      applyMark,
      removeMark,

      clearValue: (fieldId) =>
        dispatch({
          type: "clearValue",
          fieldId,
        }),

      focusField: (fieldId) =>
        dispatch({
          type: "focusField",
          fieldId,
        }),

      start: () =>
        dispatch({
          type: "start",
        }),
    }),
    [session, scheduleFieldSave, applyMark, removeMark],
  );

  const flushPendingFieldSaves = useCallback(async () => {
    const pendingEntries = Array.from(saveTimersRef.current.values());

    saveTimersRef.current.clear();

    /*
     * Debounce gözləyən field-ləri
     * dərhal save edirik.
     */
    const flushedSaves = pendingEntries.map(({ timer, field, value }) => {
      clearTimeout(timer);

      return persistFieldValue(field, value);
    });

    if (flushedSaves.length > 0) {
      const results = await Promise.all(flushedSaves);

      if (results.some((result) => result === false)) {
        return false;
      }
    }

    while (fieldSavePromisesRef.current.size > 0) {
      await Promise.allSettled(Array.from(fieldSavePromisesRef.current));
    }

    return true;
  }, [persistFieldValue]);

  const finish = useCallback(async () => {
    if (!session) {
      return false;
    }

    if (submitInFlightRef.current) {
      return false;
    }

    submitInFlightRef.current = true;

    dispatch({
      type: "submitting",
    });

    try {
      const fieldsSaved = await flushPendingFieldSaves();

      if (!fieldsSaved) {
        dispatch({
          type: "submitFailed",
          error: new Error("Some field values could not be saved."),
        });

        toast.error("Please try again. Some field values could not be saved.");

        return false;
      }

      const result = await signingRepository.completeSigning(session);

      dispatch({
        type: "completed",
        result,
      });

      toast.success("Signing completed successfully.");

      return true;
    } catch (error) {
      dispatch({
        type: "submitFailed",
        error,
      });

      toast.error(
        error instanceof Error
          ? error.message
          : "Signing could not be completed.",
      );

      return false;
    } finally {
      submitInFlightRef.current = false;
    }
  }, [session, flushPendingFieldSaves]);

  const decline = useCallback(
    async (reason) => {
      if (!session) {
        return false;
      }

      if (submitInFlightRef.current) {
        return false;
      }

      submitInFlightRef.current = true;

      dispatch({
        type: "submitting",
      });

      try {
        const result = await signingRepository.declineSigning(session, reason);

        dispatch({
          type: "declined",
          result,
        });

        toast.success("Agreement declined successfully.");

        return true;
      } catch (error) {
        dispatch({
          type: "submitFailed",
          error,
        });

        toast.error(
          error instanceof Error
            ? error.message
            : "The agreement could not be declined.",
        );

        return false;
      } finally {
        submitInFlightRef.current = false;
      }
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
