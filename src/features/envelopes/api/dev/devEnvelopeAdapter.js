import { readPdfPages, releasePdf } from "@/components/shared";
import { CURRENT_USER } from "@/data/people";
import {
  fromDocumentDto,
  fromEnvelopeDto,
  toEnvelopeDto,
} from "../../mappers/envelopeMapper";
import { createServerLikeId, isClientId } from "../clientIds";
import { EnvelopeNotFoundError, InvalidDocumentError } from "../envelopeErrors";
import { LEGACY_DOCUMENT_IDS, buildSeedEnvelopes } from "./devEnvelopeSeed";

/**
 * DEVELOPMENT ADAPTER — in-memory stand-in for the ASP.NET Envelope API.
 * Implements the same contract as the future API adapter (see
 * envelopeRepository.js). It stores transport-shaped DTOs and goes through
 * the same mapper, so switching adapters changes nothing above this layer.
 * Data lives for the browser session only.
 */

const senderOf = (user) => ({
  displayName: user.name,
  email: "nazrin.guliyeva@lvlogistics.az",
});
const store = new Map(
  Object.entries(buildSeedEnvelopes(senderOf(CURRENT_USER))),
);

/** Simulated network latency so loading/saving states are visible. */
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => structuredClone(value);
const now = () => new Date().toISOString().slice(0, 19);

function requireEnvelope(envelopeId) {
  const dto = store.get(LEGACY_DOCUMENT_IDS[envelopeId] ?? envelopeId);
  if (!dto) throw new EnvelopeNotFoundError(envelopeId);
  return dto;
}

/** The server assigns real ids to anything created in the browser. */
const withServerIds = (items) =>
  items.map((item) =>
    isClientId(item.id) ? { ...item, id: createServerLikeId() } : item,
  );

export const devEnvelopeAdapter = {
  async getEnvelope(envelopeId) {
    await delay();
    return fromEnvelopeDto(clone(requireEnvelope(envelopeId)));
  },

  async createEnvelope({ title = "Untitled envelope" } = {}) {
    await delay();
    const dto = {
      id: createServerLikeId(),
      title,
      status: "draft",
      routingMode: "sequential",
      sender: senderOf(CURRENT_USER),
      emailSubject: `Please sign: ${title}`,
      emailMessage: "",
      dueDate: null,
      reminderEveryDays: 2,
      updatedAt: now(),
      documents: [],
      recipients: [],
      fields: [],
      routingRules: [],
    };
    store.set(dto.id, dto);
    return fromEnvelopeDto(clone(dto));
  },

  async uploadDocument(envelopeId, file) {
    requireEnvelope(envelopeId);
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) throw new InvalidDocumentError("Only PDF files can be added.");

    // A real server stores the file and reports its pages; here the browser does it.
    const fileUrl = URL.createObjectURL(file);
    try {
      const pages = await readPdfPages(fileUrl);
      return fromDocumentDto({
        id: createServerLikeId(),
        name: file.name,
        fileUrl,
        order: 0,
        pages,
      });
    } catch {
      URL.revokeObjectURL(fileUrl);
      await releasePdf(fileUrl);
      throw new InvalidDocumentError(
        `“${file.name}” could not be read as a PDF.`,
      );
    }
  },

  async saveDraft(envelope) {
    await delay(400);
    const dto = toEnvelopeDto(envelope);
    const idMap = {};
    const remember = (items) =>
      withServerIds(items).map((item, index) => {
        idMap[items[index].id] = item.id;
        return item;
      });

    const recipients = remember(dto.recipients);
    const fields = remember(dto.fields).map((field) => ({
      ...field,
      recipientId: idMap[field.recipientId] ?? field.recipientId,
    }));
    const saved = { ...dto, recipients, fields, updatedAt: now() };
    store.set(saved.id, saved);

    // idMap lets the editor swap temporary ids for server ids without reloading.
    return { updatedAt: saved.updatedAt, idMap };
  },

  async sendEnvelope(envelopeId) {
    await delay(600);
    const dto = requireEnvelope(envelopeId);
    store.set(dto.id, { ...dto, status: "sent", updatedAt: now() });
    return { status: "sent" };
  },
};
