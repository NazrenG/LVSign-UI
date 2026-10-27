import {
  SigningAccessDeniedError,
  SigningSessionNotFoundError,
} from "../signingErrors";
import {
  fromSigningSessionDto,
  toCompleteSigningDto,
} from "../../mappers/signingMapper";
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

  async completeSigning(session, values) {
    await delay(700);
    const dto = find(session.envelopeId);
    const body = toCompleteSigningDto(session, values);
    const valueById = Object.fromEntries(
      body.fields.map((item) => [item.fieldId, item.value]),
    );
    const now = new Date().toISOString();

    const envelopeStatus =
      dto.remainingRecipients > 0 ? "inProgress" : "completed";
    store.set(dto.envelopeId, {
      ...dto,
      envelopeStatus,
      recipient: { ...dto.recipient, status: "completed" },
      fields: dto.fields.map((field) =>
        field.id in valueById
          ? { ...field, value: valueById[field.id], completedAt: now }
          : field,
      ),
    });
    return {
      recipientStatus: "completed",
      envelopeStatus,
      remainingRecipients: dto.remainingRecipients,
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
    return { recipientStatus: "declined", envelopeStatus: "declined" };
  },
};
