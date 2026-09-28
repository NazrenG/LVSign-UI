import {
  AlignLeft,
  Calendar,
  CalendarDays,
  CaseUpper,
  CreditCard,
  Hash,
  List,
  Monitor,
  PenLine,
  Scale,
  SquareCheck,
  Truck,
  User,
  Users,
} from "lucide-react";

/* ---------- categories ---------- */

export const TEMPLATE_CATEGORIES = [
  { value: "HR", label: "HR", icon: Users },
  { value: "Finance", label: "Finance", icon: CreditCard },
  { value: "Operations", label: "Operations", icon: Truck },
  { value: "IT & Admin", label: "IT & Admin", icon: Monitor },
  { value: "Legal", label: "Legal", icon: Scale },
];

export const getCategory = (value) =>
  TEMPLATE_CATEGORIES.find((category) => category.value === value) ??
  TEMPLATE_CATEGORIES[0];

/* ---------- list sorting ---------- */

export const SORT_OPTIONS = [
  { value: "mostUsed", label: "Most used" },
  { value: "recent", label: "Recently updated" },
  { value: "name", label: "Name A–Z" },
];

export const PAGE_SIZE = 9;

/* ---------- fields ---------- */

/** `signing: true` fields are placed inside a signer's signature block. */
export const FIELD_TYPES = {
  signature: { label: "Signature", icon: PenLine, signing: true },
  initials: { label: "Initials", icon: CaseUpper, signing: true },
  dateSigned: { label: "Date signed", icon: Calendar, signing: true },
  fullName: { label: "Full name", icon: User },
  text: { label: "Text", icon: AlignLeft },
  dropdown: { label: "Dropdown", icon: List },
  number: { label: "Number", icon: Hash },
  checkbox: { label: "Checkbox", icon: SquareCheck },
  date: { label: "Date", icon: CalendarDays },
};

/** Order of the "Add fields" palette in the builder. */
export const FIELD_PALETTE = [
  "signature",
  "initials",
  "dateSigned",
  "fullName",
  "text",
  "dropdown",
  "number",
  "checkbox",
];

/** Non-role fillers. A field can also be filled by a signer role (its role id). */
export const FILLER = {
  SENDER: "sender",
  HR_SYSTEM: "hrSystem",
  CALCULATED: "calculated",
};

export const FILLER_LABELS = {
  [FILLER.SENDER]: "Sender",
  [FILLER.HR_SYSTEM]: "HR system",
  [FILLER.CALCULATED]: "Calculated",
};

/* ---------- roles & workflow ---------- */

export const ROLE_ACTIONS = [
  { value: "approve", label: "Approve and sign" },
  { value: "acknowledge", label: "Sign to acknowledge" },
  { value: "review", label: "Review only" },
];

export const SIGNING_ORDER = [
  { value: "sequential", label: "In order" },
  { value: "parallel", label: "All at once" },
];

export const DECLINE_RULES = [
  "Stop the route and notify the sender",
  "Skip to the next signer",
  "Return to the sender for changes",
];

export const COMPLETE_RULES = [
  "Send a copy to Payroll and archive",
  "Archive only",
  "Send a copy to all signers",
];

export const COPY_RECIPIENTS = ["Payroll team", "Finance team", "Line manager"];

/* ---------- expiry ---------- */

export const VALID_FOR_OPTIONS = [
  "Until the leave ends",
  "30 days",
  "1 year",
  "No end date",
];

export const EXPIRE_ACTIONS = [
  { value: "expire", label: "Mark as Expired and notify the sender" },
  { value: "extend", label: "Offer the sender a one-time 7-day extension" },
];

/* ---------- builder ---------- */

export const BUILDER_STEPS = [
  { id: "basic", label: "Basic info" },
  { id: "roles", label: "Roles & workflow" },
  { id: "fields", label: "Fields" },
  { id: "expiry", label: "Expiry & reminders" },
];
