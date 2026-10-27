import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { envelopeRepository } from "../api/envelopeRepository";
import { EnvelopeNotFoundError } from "../api/envelopeErrors";
import {
  getFieldOwners,
  renumberRoutingOrder,
  sortByRoutingOrder,
} from "../utils/envelopeSelectors";
import { getSendChecks, isReadyToSend } from "../utils/sendChecks";
import { useDraftAutosave } from "./useDraftAutosave";
import { useEnvelopeDraft } from "./useEnvelopeDraft";
import { releasePdf } from "@/components/shared";
import { isClientId } from "../api/clientIds";
import { ROUTING_MODE } from "../models/envelopeModel";

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
  const [users, setUsers] = useState([]);
  const syncingFieldIds = useRef(new Set());
  // UI selection — deliberately outside the undoable domain state.
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [activeDocumentId, setActiveDocumentId] = useState(
    initialDocumentId ?? null,
  );
  const [activeRecipientId, setActiveRecipientId] = useState(null);

  /* ---------- load ---------- */

  // Id of the envelope currently in state; lets "new" → real id skip a reload.
  const loadedIdRef = useRef(null);
  const sendInFlightRef = useRef(false); //for double click
  const documentActionsInFlightRef = useRef(new Set());

  useEffect(() => {
    let isCurrent = true;

    envelopeRepository
      .listUsers()
      .then((result) => {
        if (isCurrent) {
          setUsers(result);
        }
      })
      .catch((error) => {
        console.error("Users could not be loaded.", error);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (loadState.status !== "ready" || !envelope) {
      return;
    }

    const pendingFields = envelope.fields.filter(
      (field) =>
        isClientId(field.id) &&
        !syncingFieldIds.current.has(field.id) &&
        field.documentId &&
        !isClientId(field.documentId) &&
        field.recipientId &&
        !isClientId(field.recipientId),
    );

    pendingFields.forEach((field) => {
      syncingFieldIds.current.add(field.id);

      envelopeRepository
        .createField(envelope.id, field)
        .then((saved) => {
          if (!saved?.id) {
            throw new Error("Field id was not returned.");
          }

          const idMap = {
            [field.id]: saved.id,
          };

          actions.applyServerIds(idMap);

          Object.assign(idAliases.current, idMap);

          setSelectedFieldId((current) =>
            current === field.id ? saved.id : current,
          );
        })
        .catch((error) => {
          console.error("Field could not be created.", error);

          actions.removeField(field.id);

          setSelectedFieldId((current) =>
            current === field.id ? null : current,
          );
        });
    });
  }, [envelope, loadState.status, actions]);

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
      deleteSelectedField: async () => {
        if (!selectedFieldId) {
          return;
        }

        const fieldId = resolveId(selectedFieldId);

        const field = envelope.fields.find((item) => item.id === fieldId);

        if (!field) {
          return;
        }

        if (isClientId(field.id)) {
          actions.removeField(field.id);

          setSelectedFieldId(null);

          return;
        }

        await envelopeRepository.deleteField(envelope.id, field.id);
        actions.removeField(field.id);

        setSelectedFieldId(null);
      },

      addDocument: async (file) => {
        const key = `upload:${file.name}:${file.size}`;

        if (documentActionsInFlightRef.current.has(key)) {
          return;
        }

        documentActionsInFlightRef.current.add(key);

        try {
          const document = await envelopeRepository.uploadDocument(
            envelope.id,
            file,
          );

          actions.addDocument(document);

          setActiveDocumentId(document.id);

          return document;
        } finally {
          documentActionsInFlightRef.current.delete(key);
        }
      },
      removeDocument: async (documentId) => {
        const resolvedId = resolveId(documentId);

        const key = `delete:${resolvedId}`;

        if (documentActionsInFlightRef.current.has(key)) {
          return;
        }

        documentActionsInFlightRef.current.add(key);

        try {
          await envelopeRepository.deleteDocument(envelope.id, resolvedId);

          const document = envelope.documents.find(
            (item) => item.id === resolvedId,
          );

          actions.removeDocument(resolvedId);

          if (document?.fileUrl) {
            await releasePdf(document.fileUrl);

            URL.revokeObjectURL(document.fileUrl);
          }

          if (activeDocumentId === resolvedId) {
            const next = envelope.documents.find(
              (item) => item.id !== resolvedId,
            );

            setActiveDocumentId(next?.id ?? null);
          }
        } finally {
          documentActionsInFlightRef.current.delete(key);
        }
      },

      addRecipient: (values) => {
        const id = actions.addRecipient(values);
        setActiveRecipientId(id);
        return id;
      },
      saveRecipient: async (recipientDraft) => {
        const recipient = envelope.recipients.find(
          (item) => item.id === recipientDraft.id,
        );

        if (!recipient) {
          throw new Error("Recipient was not found.");
        }

        if (!recipientDraft.userId) {
          throw new Error("Please select an employee.");
        }

        const { id, ...recipientPatch } = recipientDraft;

        // EXISTING RECIPIENT
        if (!isClientId(id)) {
          await envelopeRepository.updateRecipient(
            envelope.id,
            id,
            recipientDraft,
          );

          actions.updateRecipient(id, recipientPatch);

          return id;
        }

        // NEW RECIPIENT
        const saved = await envelopeRepository.createRecipient(
          envelope.id,
          recipientDraft,
        );

        actions.updateRecipient(id, recipientPatch);

        const idMap = {
          [id]: saved.id,
        };

        actions.applyServerIds(idMap);

        Object.assign(idAliases.current, idMap);

        setActiveRecipientId(saved.id);

        return saved.id;
      },

      removeRecipient: async (recipientId) => {
        const recipient = envelope.recipients.find(
          (item) => item.id === recipientId,
        );

        if (!recipient) return;

        if (isClientId(recipient.id)) {
          actions.removeRecipient(recipient.id);

          return;
        }

        await envelopeRepository.deleteRecipient(envelope.id, recipient.id);

        actions.removeRecipient(recipient.id);

        setActiveRecipientId((current) =>
          current === recipient.id ? null : current,
        );
      },

      async createField(envelopeId, field) {
        if (!field.documentId) {
          throw new Error("Field document is required.");
        }

        if (!field.recipientId) {
          throw new Error("Field recipient is required.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/envelopes/${envelopeId}/fields`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              envelopeDocumentId: field.documentId,

              envelopeRecipientId: field.recipientId,

              // FieldOwnerType.Recipient
              ownerType: 1,

              fieldType: FIELD_TYPE_TO_API[field.type],

              pageNumber: field.pageNumber,

              x: field.x,

              y: field.y,

              width: field.width,

              height: field.height,

              isRequired: field.isRequired,
            }),
          },
        );

        if (!response.ok) {
          const message = await response.text();

          throw new Error(message || "Field could not be created.");
        }

        return response.json();
      },

      updateField: async (fieldId, patch, options = {}) => {
        const resolvedId = resolveId(fieldId);

        const field = envelope.fields.find((item) => item.id === resolvedId);

        if (!field) {
          return;
        }

        if (isClientId(field.id)) {
          actions.updateField(field.id, patch, options);

          return;
        }

        const updatedField = {
          ...field,
          ...patch,
        };

        await envelopeRepository.updateField(
          envelope.id,
          field.id,
          updatedField,
        );

        actions.updateField(field.id, patch, options);
      },

      send: async () => {
        if (sendInFlightRef.current) {
          return;
        }

        sendInFlightRef.current = true;
        try {
          if (autosave.isDirty) {
            const saved = await autosave.saveNow();
            if (!saved)
              throw new Error(
                "The draft could not be saved, so it was not sent.",
              );
          }
          return await envelopeRepository.sendEnvelope(envelope.id);
        } finally {
          sendInFlightRef.current = false;
        }
      },

      setRoutingMode: async (mode) => {
        if (mode === envelope.routingMode) {
          return;
        }

        const ordered = sortByRoutingOrder(envelope.recipients);

        const nextRecipients =
          mode === ROUTING_MODE.PARALLEL
            ? ordered.map((recipient) => ({
                ...recipient,
                routingOrder: 1,
              }))
            : renumberRoutingOrder(ordered);

        const changedRecipients = nextRecipients.filter((next) => {
          const current = envelope.recipients.find(
            (recipient) => recipient.id === next.id,
          );

          return current && current.routingOrder !== next.routingOrder;
        });

        await Promise.all(
          changedRecipients.map((recipient) =>
            envelopeRepository.updateRecipient(
              envelope.id,
              recipient.id,
              recipient,
            ),
          ),
        );

        actions.setRoutingMode(mode);
      },

      moveDocument: async (documentId, offset) => {
        const currentIndex = envelope.documents.findIndex(
          (document) => document.id === documentId,
        );

        const targetIndex = currentIndex + offset;

        if (
          currentIndex < 0 ||
          targetIndex < 0 ||
          targetIndex >= envelope.documents.length
        ) {
          return;
        }

        const reordered = [...envelope.documents];

        [reordered[currentIndex], reordered[targetIndex]] = [
          reordered[targetIndex],
          reordered[currentIndex],
        ];

        await envelopeRepository.reorderDocuments(
          envelope.id,
          reordered.map((document) => document.id),
        );

        actions.moveDocument(documentId, offset);
      },

      createRoutingRule: async (values) => {
        const rule = await envelopeRepository.createRoutingRule(envelope.id, {
          ...values,

          priority: envelope.routingRules.length + 1,
        });

        actions.addRoutingRule(rule);

        return rule;
      },
      deleteRoutingRule: async (ruleId) => {
        await envelopeRepository.deleteRoutingRule(envelope.id, ruleId);

        actions.removeRoutingRule(ruleId);
      },
      updateRoutingRule: async (ruleId, values) => {
        const current = envelope.routingRules.find(
          (rule) => rule.id === ruleId,
        );

        if (!current) {
          throw new Error("Routing rule was not found.");
        }

        const updated = await envelopeRepository.updateRoutingRule(
          envelope.id,
          ruleId,
          {
            ...current,
            ...values,
          },
        );

        actions.updateRoutingRule(updated);

        return updated;
      },
    }),
    [actions, activeRecipient, envelope, selectedFieldId, autosave],
  );

  return {
    status: loadState.status,
    error: loadState.error,
    envelope,
    actions,
    users,
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
