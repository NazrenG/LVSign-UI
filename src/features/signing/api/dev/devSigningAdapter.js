import {
  SigningAccessDeniedError,
  SigningSessionNotFoundError,
} from "../signingErrors";
import { fromSigningSessionDto } from "../../mappers/signingMapper";
import { DEV_ENVELOPES, LEGACY_IDS, buildSeed } from "./devSigningSeed";

/**
 * DEVELOPMENT ADAPTER — in-memory stand-in for the signing API.
 * Same contract as apiSigningAdapter; goes through the same mapper.
 * Completing or declining changes the stored session for this browser
 * session, so reopening the link shows "already completed".
 */
const store = new Map(Object.entries(buildSeed()));
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => structuredClone(value);

function find(envelopeId) {
  const id = LEGACY_IDS[envelopeId] ?? envelopeId;
  if (id === DEV_ENVELOPES.ACCESS_DENIED) throw new SigningAccessDeniedError();
  const dto = store.get(id);
  if (!dto) throw new SigningSessionNotFoundError(envelopeId);
  return dto;
}

export const devSigningAdapter = {
  async getSession(envelopeId) {
    await delay();

    return fromSigningSessionDto(clone(find(envelopeId)));
  },

  async applyMark(envelopeId, field, mark) {
    await delay(250);

    return {
      id: crypto.randomUUID(),

      sourceId: mark?.sourceId ?? crypto.randomUUID(),

      kind:
        field.fieldType === "signature"
          ? 1
          : field.fieldType === "initials"
            ? 2
            : 3,

      appliedAt: new Date().toISOString(),
    };
  },

  async removeMark() {
    await delay(200);
  },

  async saveFieldValue(envelopeId, field, value) {
    await delay(200);

    return {
      fieldId: field.id,

      value,

      filledAt: new Date().toISOString(),
    };
  },

  async completeSigning(session) {
    await delay(700);

    const dto = find(session.envelopeId);

    const now = new Date().toISOString();

    const isEnvelopeCompleted = (dto.remainingRecipients ?? 0) <= 0;

    const envelopeStatus = isEnvelopeCompleted ? "completed" : "inProgress";

    store.set(dto.envelopeId, {
      ...dto,

      envelopeStatus,

      recipient: {
        ...dto.recipient,

        status: "completed",

        completedAt: now,
      },
    });

    return {
      recipientId: dto.recipient.id,

      recipientStatus: "completed",

      envelopeStatus,

      isEnvelopeCompleted,

      currentRoutingOrder: isEnvelopeCompleted
        ? null
        : dto.recipient.routingOrder + 1,

      completedAt: now,
    };
  },

  async declineSigning(session, reason) {
    await delay(500);

    const dto = find(session.envelopeId);

    store.set(dto.envelopeId, {
      ...dto,

      envelopeStatus: "declined",

      recipient: {
        ...dto.recipient,

        status: "declined",

        declineReason: reason,
      },
    });

    return {
      recipientStatus: "declined",

      envelopeStatus: "declined",
    };
  },
};
