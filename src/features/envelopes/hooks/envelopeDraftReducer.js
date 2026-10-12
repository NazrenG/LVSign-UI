import { ROUTING_MODE } from "../models/envelopeModel";
import { FIELD_TYPES } from "../models/fieldTypes";
import { clampRect, rectCenteredAt, sizeForPage } from "../utils/coordinates";
import {
  getDocument,
  getFieldsOnPage,
  nextRoutingOrder,
  renumberRoutingOrder,
  sortByRoutingOrder,
} from "../utils/envelopeSelectors";

/**
 * Pure reducer for an envelope being prepared. Ids are never generated here —
 * actions carry them — so the reducer is deterministic and testable.
 */
export const DRAFT = {
  LOADED: "envelope/loaded",
  UPDATE_DETAILS: "envelope/updateDetails",
  SET_ROUTING_MODE: "envelope/setRoutingMode",
  ADD_DOCUMENT: "document/add",
  REMOVE_DOCUMENT: "document/remove",
  MOVE_DOCUMENT: "document/move",
  ADD_RECIPIENT: "recipient/add",
  UPDATE_RECIPIENT: "recipient/update",
  REMOVE_RECIPIENT: "recipient/remove",
  MOVE_RECIPIENT: "recipient/move",
  PLACE_FIELD: "field/place",
  DUPLICATE_FIELD: "field/duplicate",
  UPDATE_FIELD: "field/update",
  REMOVE_FIELD: "field/remove",
  APPLY_SERVER_IDS: "ids/applyServerIds",
};

const GEOMETRY_KEYS = ["x", "y", "width", "height"];
const DEFAULT_OPTIONS = ["Option 1", "Option 2"];
/** Offset for duplicates and for repeated clicks on the same palette item. */
const CASCADE_STEP = 0.02;

const swap = (list, index, offset) => {
  const target = index + offset;
  if (index < 0 || target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
};

const replaceById = (list, id, update) =>
  list.map((item) => (item.id === id ? update(item) : item));

export function envelopeDraftReducer(envelope, action) {
  switch (action.type) {
    case DRAFT.LOADED:
      return action.envelope;

    case DRAFT.UPDATE_DETAILS:
      return { ...envelope, ...action.patch };

    case DRAFT.SET_ROUTING_MODE: {
      if (envelope.routingMode === action.mode) return envelope;
      // Switching to "in order" spreads everyone over consecutive steps.
      const recipients =
        action.mode === ROUTING_MODE.SEQUENTIAL
          ? renumberRoutingOrder(sortByRoutingOrder(envelope.recipients))
          : envelope.recipients;
      return { ...envelope, routingMode: action.mode, recipients };
    }

    case DRAFT.ADD_DOCUMENT:
      return {
        ...envelope,
        documents: [...envelope.documents, action.document],
      };

    case DRAFT.REMOVE_DOCUMENT:
      return {
        ...envelope,
        documents: envelope.documents.filter(
          (document) => document.id !== action.id,
        ),
        fields: envelope.fields.filter(
          (field) => field.documentId !== action.id,
        ),
      };

    case DRAFT.MOVE_DOCUMENT: {
      const index = envelope.documents.findIndex(
        (document) => document.id === action.id,
      );
      return {
        ...envelope,
        documents: swap(envelope.documents, index, action.offset),
      };
    }

    case DRAFT.ADD_RECIPIENT: {
      const routingOrder =
        envelope.routingMode === ROUTING_MODE.PARALLEL
          ? 1
          : nextRoutingOrder(envelope.recipients);
      return {
        ...envelope,
        recipients: [
          ...envelope.recipients,
          { ...action.recipient, routingOrder },
        ],
      };
    }

    case DRAFT.UPDATE_RECIPIENT:
      return {
        ...envelope,
        recipients: replaceById(
          envelope.recipients,
          action.id,
          (recipient) => ({
            ...recipient,
            ...action.patch,
          }),
        ),
      };

    case DRAFT.REMOVE_RECIPIENT:
      return {
        ...envelope,
        recipients: envelope.recipients.filter(
          (recipient) => recipient.id !== action.id,
        ),
        // Keep the fields; they show up as "no recipient" until reassigned.
        fields: envelope.fields.map((field) =>
          field.recipientId === action.id
            ? { ...field, recipientId: null }
            : field,
        ),
      };

    case DRAFT.MOVE_RECIPIENT: {
      const ordered = sortByRoutingOrder(envelope.recipients);
      const index = ordered.findIndex(
        (recipient) => recipient.id === action.id,
      );
      return {
        ...envelope,
        recipients: renumberRoutingOrder(swap(ordered, index, action.offset)),
      };
    }

    case DRAFT.PLACE_FIELD: {
      // action: { id, fieldType, documentId, pageNumber, recipientId, point? }
      const page = getDocument(envelope, action.documentId)?.pages[
        action.pageNumber - 1
      ];
      if (!page) return envelope;
      const definition = FIELD_TYPES[action.fieldType];
      const cascade =
        getFieldsOnPage(envelope, action.documentId, action.pageNumber).length %
        8;
      const centre = action.point ?? {
        x: 0.5,
        y: 0.4 + cascade * CASCADE_STEP,
      };
      const field = {
        id: action.id,
        documentId: action.documentId,
        pageNumber: action.pageNumber,
        recipientId: action.recipientId ?? null,
        type: action.fieldType,
        label: definition.label,
        isRequired: true,
        ...(definition.hasOptions && { options: [...DEFAULT_OPTIONS] }),
        ...rectCenteredAt(centre, sizeForPage(definition.defaultSize, page)),
      };
      return { ...envelope, fields: [...envelope.fields, field] };
    }

    case DRAFT.DUPLICATE_FIELD: {
      const source = envelope.fields.find(
        (field) => field.id === action.sourceId,
      );
      if (!source) return envelope;
      const copy = clampRect({
        ...source,
        x: source.x + CASCADE_STEP,
        y: source.y + CASCADE_STEP,
      });
      return {
        ...envelope,
        fields: [...envelope.fields, { ...source, ...copy, id: action.id }],
      };
    }

    case DRAFT.UPDATE_FIELD:
      return {
        ...envelope,
        fields: replaceById(envelope.fields, action.id, (field) => {
          const next = { ...field, ...action.patch };
          const touchesGeometry = GEOMETRY_KEYS.some(
            (key) => key in action.patch,
          );
          return touchesGeometry ? { ...next, ...clampRect(next) } : next;
        }),
      };

    case DRAFT.REMOVE_FIELD:
      return {
        ...envelope,
        fields: envelope.fields.filter((field) => field.id !== action.id),
      };

    case DRAFT.APPLY_SERVER_IDS: {
      const map = (id) => action.idMap[id] ?? id;
      if (!envelope) return envelope;
      return {
        ...envelope,
        recipients: envelope.recipients.map((recipient) => ({
          ...recipient,
          id: map(recipient.id),
        })),
        fields: envelope.fields.map((field) => ({
          ...field,
          id: map(field.id),
          recipientId: field.recipientId && map(field.recipientId),
        })),
      };
    }

    default:
      throw new Error(`Unknown envelope draft action: ${action.type}`);
  }
}
