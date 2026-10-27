import { useMemo } from "react";
import { useUndoableReducer } from "@/hooks/useUndoableReducer";
import { createClientId } from "../api/clientIds";
import {
  DEFAULT_RECIPIENT_PERMISSIONS,
  RECIPIENT_STATUS,
} from "../models/envelopeModel";
import { RECIPIENT_TYPE } from "../models/recipientTypes";
import { DRAFT, envelopeDraftReducer } from "./envelopeDraftReducer";

/**
 * Domain state of the envelope being prepared, with undo/redo and
 * intention-revealing actions. New entities get temporary client ids here
 * (see api/clientIds.js); everything else happens in the pure reducer.
 */
export function useEnvelopeDraft() {
  const {
    present: envelope,
    revision,
    canUndo,
    canRedo,
    dispatch,
    undo,
    redo,
  } = useUndoableReducer(envelopeDraftReducer, null);

  const actions = useMemo(
    () => ({
      load: (loaded) =>
        dispatch({
          type: DRAFT.LOADED,
          envelope: loaded,
          meta: { skipHistory: true },
        }),
      applyServerIds: (idMap) =>
        dispatch({
          type: DRAFT.APPLY_SERVER_IDS,
          idMap,
          meta: { applyToHistory: true },
        }),

      updateDetails: (patch) =>
        dispatch({
          type: DRAFT.UPDATE_DETAILS,
          patch,
          meta: { coalesceKey: `details:${Object.keys(patch).join(",")}` },
        }),

      removeRoutingRule: (id) =>
        dispatch({
          type: DRAFT.REMOVE_ROUTING_RULE,
          id,

          meta: {
            skipHistory: true,
          },
        }),

      updateRoutingRule: (rule) =>
        dispatch({
          type: DRAFT.UPDATE_ROUTING_RULE,

          rule,

          meta: {
            skipHistory: true,
          },
        }),

      addRoutingRule: (rule) =>
        dispatch({
          type: DRAFT.ADD_ROUTING_RULE,
          rule,
          meta: {
            skipHistory: true,
          },
        }),
      setRoutingMode: (mode) =>
        dispatch({ type: DRAFT.SET_ROUTING_MODE, mode }),

      addDocument: (document) =>
        dispatch({ type: DRAFT.ADD_DOCUMENT, document }),
      removeDocument: (id) => dispatch({ type: DRAFT.REMOVE_DOCUMENT, id }),
      moveDocument: (id, offset) =>
        dispatch({ type: DRAFT.MOVE_DOCUMENT, id, offset }),

      /** Returns the new recipient's id. Routing order is set by the reducer. */
      addRecipient: (values = {}) => {
        const recipient = {
          id: createClientId(),
          userId: null,
          displayName: "",
          email: "",
          roleName: "",
          recipientType: RECIPIENT_TYPE.SIGNER,
          isRequired: true,
          status: RECIPIENT_STATUS.CREATED,
          permissions: { ...DEFAULT_RECIPIENT_PERMISSIONS },
          ...values,
        };
        dispatch({ type: DRAFT.ADD_RECIPIENT, recipient });
        return recipient.id;
      },
      updateRecipient: (id, patch) =>
        dispatch({
          type: DRAFT.UPDATE_RECIPIENT,
          id,
          patch,
          meta: {
            coalesceKey: `recipient:${id}:${Object.keys(patch).join(",")}`,
          },
        }),
      removeRecipient: (id) => dispatch({ type: DRAFT.REMOVE_RECIPIENT, id }),
      moveRecipient: (id, offset) =>
        dispatch({ type: DRAFT.MOVE_RECIPIENT, id, offset }),

      /**
       * Places a new field on a page. `point` is the normalized centre;
       * without it the field lands mid-page. Returns the new field's id.
       */
      placeField: (
        fieldType,
        { documentId, pageNumber, recipientId, point },
      ) => {
        const id = createClientId();
        dispatch({
          type: DRAFT.PLACE_FIELD,
          id,
          fieldType,
          documentId,
          pageNumber,
          recipientId,
          point,
        });
        return id;
      },
      /** Geometry in the patch is normalized and clamped to the page by the reducer. */
      updateField: (id, patch, { coalesceKey } = {}) =>
        dispatch({
          type: DRAFT.UPDATE_FIELD,
          id,
          patch,
          meta: { coalesceKey },
        }),
      removeField: (id) => dispatch({ type: DRAFT.REMOVE_FIELD, id }),
      /** Returns the copy's id. */
      duplicateField: (sourceId) => {
        const id = createClientId();
        dispatch({ type: DRAFT.DUPLICATE_FIELD, sourceId, id });
        return id;
      },

      undo,
      redo,
    }),
    [dispatch, undo, redo],
  );

  return { envelope, revision, canUndo, canRedo, actions };
}
