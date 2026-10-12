/**
 * Temporary client-side IDs for entities created in the editor before the
 * server has assigned real ones (new recipients, new fields).
 *
 * They are prefixed so they can never be mistaken for server IDs:
 *   "tmp_3f1c…"  → created in this browser, not yet persisted
 * When the API adapter saves an entity it should replace the temporary ID
 * with the ID returned by the server (see envelopeRepository.saveDraft).
 */
const PREFIX = "tmp_";

function randomUuid() {
  // crypto.randomUUID needs a secure context (https or localhost).
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export const createClientId = () => `${PREFIX}${randomUuid()}`;

export const isClientId = (id) =>
  typeof id === "string" && id.startsWith(PREFIX);

/** Used only by the development adapter to mimic server-assigned IDs. */
export const createServerLikeId = randomUuid;
