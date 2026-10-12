import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { envelopeRepository } from "../api/envelopeRepository";
import { EnvelopeNotFoundError } from "../api/envelopeErrors";
import { getFieldOwners } from "../utils/envelopeSelectors";
import { getSendChecks, isReadyToSend } from "../utils/sendChecks";
import { useDraftAutosave } from "./useDraftAutosave";
import { useEnvelopeDraft } from "./useEnvelopeDraft";

/**
 * Everything the Prepare Document screen needs, in one place:
 * loading, domain state + actions, selection, autosave, send checks, send.
 *
 * envelopeId "new" creates a draft envelope first. Whenever the loaded
 * envelope's id differs from the one asked for ("new", or an old link),
 * `onIdResolved(id)` lets the page put the real id in the URL.
 */
export function useEnvelopeEditor({
  envelopeId,
  initialDocumentId,
  onIdResolved,
}) {
  const { envelope, revision, canUndo, canRedo, actions } = useEnvelopeDraft();
  const [loadState, setLoadState] = useState({
    status: "loading",
    error: null,
  });

  // UI selection — deliberately outside the undoable domain state.
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [activeDocumentId, setActiveDocumentId] = useState(
    initialDocumentId ?? null,
  );
  const [activeRecipientId, setActiveRecipientId] = useState(null);

  /* ---------- load ---------- */

  // Id of the envelope currently in state; lets "new" → real id skip a reload.
  const loadedIdRef = useRef(null);

  useEffect(() => {
    if (envelopeId === loadedIdRef.current) return undefined;
    let isCurrent = true;
    setLoadState({ status: "loading", error: null });

    const request =
      envelopeId === "new"
        ? envelopeRepository.createEnvelope({ title: "Untitled envelope" })
        : envelopeRepository.getEnvelope(envelopeId);

    request
      .then((loaded) => {
        if (!isCurrent) return;
        loadedIdRef.current = loaded.id;
        actions.load(loaded);
        setActiveDocumentId((current) =>
          loaded.documents.some((document) => document.id === current)
            ? current
            : (loaded.documents[0]?.id ?? null),
        );
        setActiveRecipientId(getFieldOwners(loaded)[0]?.id ?? null);
        setLoadState({ status: "ready", error: null });
        if (loaded.id !== envelopeId) onIdResolved?.(loaded.id);
      })
      .catch((error) => {
        if (!isCurrent) return;
        setLoadState({
          status: error instanceof EnvelopeNotFoundError ? "notFound" : "error",
          error,
        });
      });

    return () => {
      isCurrent = false;
    };
    // onIdResolved is intentionally not a dependency: it only navigates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envelopeId, actions]);

  /* ---------- autosave ---------- */

  // Temporary id → server id, for UI state held outside this hook (e.g. an open dialog).
  const idAliases = useRef({});
  const resolveId = useCallback(
    (id) => (id && idAliases.current[id]) ?? id,
    [],
  );

  const saveDraft = useCallback(
    async (snapshot) => {
      const result = await envelopeRepository.saveDraft(snapshot);
      if (
        result.idMap &&
        Object.keys(result.idMap).some((id) => result.idMap[id] !== id)
      ) {
        actions.applyServerIds(result.idMap);
        Object.assign(idAliases.current, result.idMap);
        const remap = (id) => (id && result.idMap[id]) ?? id;
        setSelectedFieldId(remap);
        setActiveRecipientId(remap);
      }
      return result;
    },
    [actions],
  );

  const autosave = useDraftAutosave({
    value: envelope,
    revision,
    isEnabled: loadState.status === "ready",
    save: saveDraft,
  });

  /* ---------- derived ---------- */

  const checks = useMemo(
    () => (envelope ? getSendChecks(envelope) : []),
    [envelope],
  );
  const fieldOwners = useMemo(
    () => (envelope ? getFieldOwners(envelope) : []),
    [envelope],
  );

  // Keep selections pointing at things that still exist (after undo, delete …).
  const selectedField =
    envelope?.fields.find((field) => field.id === selectedFieldId) ?? null;
  const activeDocument =
    envelope?.documents.find((document) => document.id === activeDocumentId) ??
    envelope?.documents[0] ??
    null;
  const activeRecipient =
    fieldOwners.find((recipient) => recipient.id === activeRecipientId) ??
    fieldOwners[0] ??
    null;

  /* ---------- editor commands (domain action + selection) ---------- */

  const commands = useMemo(
    () => ({
      selectField: (fieldId) => {
        setSelectedFieldId(fieldId);
        const field = envelope?.fields.find((item) => item.id === fieldId);
        if (field?.recipientId) setActiveRecipientId(field.recipientId);
      },
      clearSelection: () => setSelectedFieldId(null),
      setActiveDocument: setActiveDocumentId,
      setActiveRecipient: setActiveRecipientId,

      placeField: (fieldType, placement) => {
        const id = actions.placeField(fieldType, {
          recipientId: activeRecipient?.id,
          ...placement,
        });
        setSelectedFieldId(id);
        return id;
      },
      duplicateSelectedField: () => {
        if (selectedFieldId)
          setSelectedFieldId(actions.duplicateField(selectedFieldId));
      },
      deleteSelectedField: () => {
        if (!selectedFieldId) return;
        actions.removeField(selectedFieldId);
        setSelectedFieldId(null);
      },

      addDocument: async (file) => {
        const document = await envelopeRepository.uploadDocument(
          envelope.id,
          file,
        );
        actions.addDocument(document);
        setActiveDocumentId(document.id);
        return document;
      },
      addRecipient: (values) => {
        const id = actions.addRecipient(values);
        setActiveRecipientId(id);
        return id;
      },

      send: async () => {
        if (autosave.isDirty) {
          const saved = await autosave.saveNow();
          if (!saved)
            throw new Error(
              "The draft could not be saved, so it was not sent.",
            );
        }
        return envelopeRepository.sendEnvelope(envelope.id);
      },
    }),
    [actions, activeRecipient, envelope, selectedFieldId, autosave],
  );

  return {
    status: loadState.status,
    error: loadState.error,
    envelope,
    actions,
    commands,
    history: { canUndo, canRedo, undo: actions.undo, redo: actions.redo },
    save: autosave,
    checks,
    isReadyToSend: isReadyToSend(checks),
    fieldOwners,
    selectedField,
    activeDocument,
    activeRecipient,
    resolveId,
  };
}
