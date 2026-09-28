export const AGREEMENT_STATUS = {
  AWAITING: "awaiting",
  COMPLETED: "completed",
  DRAFT: "draft",
  DECLINED: "declined",
  VOIDED: "voided",
  EXPIRED: "expired",
};

export const SIGNER_STATE = {
  SIGNED: "signed",
  CURRENT: "current",
  PENDING: "pending",
  NOT_SENT: "notSent",
  DECLINED: "declined",
};

/** Visual tone + label for every agreement status (drives <StatusBadge />). */
export const STATUS_META = {
  [AGREEMENT_STATUS.AWAITING]: { label: "Awaiting", tone: "warning" },
  [AGREEMENT_STATUS.COMPLETED]: { label: "Completed", tone: "success" },
  [AGREEMENT_STATUS.DRAFT]: { label: "Draft", tone: "neutral" },
  [AGREEMENT_STATUS.DECLINED]: { label: "Declined", tone: "danger" },
  [AGREEMENT_STATUS.VOIDED]: { label: "Voided", tone: "danger" },
  [AGREEMENT_STATUS.EXPIRED]: { label: "Expired", tone: "neutral" },
};

/** Order of the tabs on the Agreements page. */
export const STATUS_TABS = [
  { value: "all", label: "All" },
  ...Object.values(AGREEMENT_STATUS).map((value) => ({
    value,
    label: STATUS_META[value].label,
  })),
];
