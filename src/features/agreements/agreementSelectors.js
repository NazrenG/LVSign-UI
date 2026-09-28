import { PEOPLE } from "@/data/people";
import {
  formatMonthName,
  formatShortDate,
  getFirstName,
} from "@/utils/formatters";
import { AGREEMENT_STATUS, SIGNER_STATE, STATUS_META } from "./agreementStatus";

/* ---------- single agreement ---------- */

export const getPerson = (personId) => PEOPLE[personId];

export const getCurrentSigner = (agreement) =>
  agreement.signers.find((signer) => signer.state === SIGNER_STATE.CURRENT);

export const countSigned = (agreement) =>
  agreement.signers.filter((signer) => signer.state === SIGNER_STATE.SIGNED)
    .length;

/** "Awaiting 2 of 3" (2 already signed) / "Completed" / "Draft" ... */
export function getStatusLabel(agreement) {
  const { label } = STATUS_META[agreement.status];
  if (agreement.status !== AGREEMENT_STATUS.AWAITING) return label;
  return `${label} ${countSigned(agreement)} of ${agreement.signers.length}`;
}

/** Short caption under a signer in a route: "22 Sep", "Now", "Waiting", "Not yet"... */
export function getSignerCaption(signer, { isCurrentUser = false } = {}) {
  switch (signer.state) {
    case SIGNER_STATE.SIGNED:
      return formatShortDate(signer.date);
    case SIGNER_STATE.CURRENT:
      return isCurrentUser ? "Now" : "Waiting";
    case SIGNER_STATE.NOT_SENT:
      return "Not sent";
    case SIGNER_STATE.DECLINED:
      return "Declined";
    default:
      return "Not yet";
  }
}

/** "Waiting for Farid Aliyev and 1 other" */
export function getWaitingSummary(agreement) {
  const current = getCurrentSigner(agreement);
  if (!current) return "";
  const remaining = agreement.signers.filter(
    (signer) => signer.state === SIGNER_STATE.PENDING,
  ).length;
  const name = getPerson(current.personId).name;
  if (remaining === 0) return `Waiting for ${name}`;
  return `Waiting for ${name} and ${remaining} other${remaining === 1 ? "" : "s"}`;
}

export const getReminderLabel = (agreement) => {
  const current = getCurrentSigner(agreement);
  return current
    ? `Remind ${getFirstName(getPerson(current.personId).name)}`
    : null;
};

/* ---------- collections ---------- */

export const isWaitingForUser = (agreement, userId) =>
  agreement.status === AGREEMENT_STATUS.AWAITING &&
  getCurrentSigner(agreement)?.personId === userId;

export const getWaitingForUser = (agreements, userId) =>
  agreements.filter((agreement) => isWaitingForUser(agreement, userId));

export const getSentByUser = (agreements, userId) =>
  agreements.filter(
    (agreement) =>
      agreement.senderId === userId &&
      [AGREEMENT_STATUS.AWAITING, AGREEMENT_STATUS.DRAFT].includes(
        agreement.status,
      ),
  );

export const getRecentlyCompleted = (agreements, limit = 3) =>
  agreements
    .filter((agreement) => agreement.status === AGREEMENT_STATUS.COMPLETED)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit);

export function getDashboardStats(agreements, userId, now = new Date()) {
  const isThisMonth = (value) => {
    const date = new Date(value);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };
  const monthName = formatMonthName(now);

  return [
    {
      label: "Waiting for you",
      value: getWaitingForUser(agreements, userId).length,
    },
    {
      label: "Waiting for others",
      value: agreements.filter(
        (agreement) =>
          agreement.senderId === userId &&
          agreement.status === AGREEMENT_STATUS.AWAITING,
      ).length,
    },
    {
      label: `Completed in ${monthName}`,
      value: agreements.filter(
        (agreement) =>
          agreement.status === AGREEMENT_STATUS.COMPLETED &&
          isThisMonth(agreement.updatedAt),
      ).length,
    },
    {
      label: "Draft",
      value: agreements.filter(
        (agreement) => agreement.status === AGREEMENT_STATUS.DRAFT,
      ).length,
    },
  ];
}

export function countByStatus(agreements) {
  return agreements.reduce(
    (counts, agreement) => ({
      ...counts,
      [agreement.status]: (counts[agreement.status] ?? 0) + 1,
    }),
    { all: agreements.length },
  );
}

export function filterAgreements(agreements, { status = "all", query = "" }) {
  const normalizedQuery = query.trim().toLowerCase();
  return agreements.filter((agreement) => {
    const matchesStatus = status === "all" || agreement.status === status;
    const matchesQuery =
      !normalizedQuery ||
      agreement.title.toLowerCase().includes(normalizedQuery) ||
      agreement.documentId.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesQuery;
  });
}
