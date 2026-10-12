/**
 * Visual identity for recipients (dot, field tint, outline).
 * Purely presentational — colours are assigned from the recipient's position
 * in the envelope and are never stored.
 * Class names are written out in full so Tailwind can find them.
 */
const PALETTE = [
  {
    dot: "bg-recipient-1",
    text: "text-recipient-1",
    border: "border-recipient-1",
    soft: "bg-recipient-1-soft",
    ring: "ring-recipient-1",
  },
  {
    dot: "bg-recipient-2",
    text: "text-recipient-2",
    border: "border-recipient-2",
    soft: "bg-recipient-2-soft",
    ring: "ring-recipient-2",
  },
  {
    dot: "bg-recipient-3",
    text: "text-recipient-3",
    border: "border-recipient-3",
    soft: "bg-recipient-3-soft",
    ring: "ring-recipient-3",
  },
  {
    dot: "bg-recipient-4",
    text: "text-recipient-4",
    border: "border-recipient-4",
    soft: "bg-recipient-4-soft",
    ring: "ring-recipient-4",
  },
  {
    dot: "bg-recipient-5",
    text: "text-recipient-5",
    border: "border-recipient-5",
    soft: "bg-recipient-5-soft",
    ring: "ring-recipient-5",
  },
  {
    dot: "bg-recipient-6",
    text: "text-recipient-6",
    border: "border-recipient-6",
    soft: "bg-recipient-6-soft",
    ring: "ring-recipient-6",
  },
];

/** Fields without a recipient are drawn in the danger colour. */
export const UNASSIGNED_COLORS = {
  dot: "bg-danger",
  text: "text-danger",
  border: "border-danger",
  soft: "bg-danger-soft",
  ring: "ring-danger",
};

/** Map of recipientId → colour set, stable for the current recipient list. */
export const getRecipientColorMap = (recipients) =>
  Object.fromEntries(
    recipients.map((recipient, index) => [
      recipient.id,
      PALETTE[index % PALETTE.length],
    ]),
  );
