import {
  AtSign,
  Calendar,
  CaseUpper,
  ChevronDownSquare,
  CircleDot,
  Hash,
  PenLine,
  SquareCheck,
  Stamp,
  Type,
  User,
} from "lucide-react";
import { RECIPIENT_TYPE } from "./recipientTypes";

/** @typedef {"signature"|"initials"|"dateSigned"|"text"|"fullName"|"email"|"number"|"checkbox"|"radio"|"dropdown"|"stamp"} FieldType */

const SIGNING = [RECIPIENT_TYPE.SIGNER];
const SIGNING_OR_APPROVING = [RECIPIENT_TYPE.SIGNER, RECIPIENT_TYPE.APPROVER];

/**
 * Field catalogue.
 * - defaultSize: normalized (0..1) size on an A4 portrait page
 * - allowedFor:  recipient types that may own this field
 * - hasOptions:  dropdown/radio carry a list of choices
 */
export const FIELD_TYPES = {
  signature: {
    label: "Signature",
    icon: PenLine,
    defaultSize: { width: 0.3, height: 0.06 },
    allowedFor: SIGNING,
  },
  initials: {
    label: "Initials",
    icon: CaseUpper,
    defaultSize: { width: 0.1, height: 0.045 },
    allowedFor: SIGNING_OR_APPROVING,
  },
  dateSigned: {
    label: "Date signed",
    icon: Calendar,
    defaultSize: { width: 0.18, height: 0.035 },
    allowedFor: SIGNING_OR_APPROVING,
  },
  text: {
    label: "Text",
    icon: Type,
    defaultSize: { width: 0.26, height: 0.035 },
    allowedFor: SIGNING_OR_APPROVING,
  },
  fullName: {
    label: "Full name",
    icon: User,
    defaultSize: { width: 0.26, height: 0.035 },
    allowedFor: SIGNING_OR_APPROVING,
  },
  email: {
    label: "Email",
    icon: AtSign,
    defaultSize: { width: 0.3, height: 0.035 },
    allowedFor: SIGNING_OR_APPROVING,
  },
  number: {
    label: "Number",
    icon: Hash,
    defaultSize: { width: 0.14, height: 0.035 },
    allowedFor: SIGNING_OR_APPROVING,
  },
  checkbox: {
    label: "Checkbox",
    icon: SquareCheck,
    defaultSize: { width: 0.035, height: 0.025 },
    allowedFor: SIGNING_OR_APPROVING,
  },
  radio: {
    label: "Radio button",
    icon: CircleDot,
    defaultSize: { width: 0.2, height: 0.06 },
    allowedFor: SIGNING_OR_APPROVING,
    hasOptions: true,
  },
  dropdown: {
    label: "Dropdown",
    icon: ChevronDownSquare,
    defaultSize: { width: 0.24, height: 0.035 },
    allowedFor: SIGNING_OR_APPROVING,
    hasOptions: true,
  },
  stamp: {
    label: "Stamp",
    icon: Stamp,
    defaultSize: { width: 0.16, height: 0.09 },
    allowedFor: SIGNING_OR_APPROVING,
  },
};

/** Order of the palette buttons. */
export const FIELD_PALETTE = Object.keys(FIELD_TYPES);

export const FIELD_TYPE_OPTIONS = FIELD_PALETTE.map((value) => ({
  value,
  label: FIELD_TYPES[value].label,
}));

export const isFieldAllowedFor = (fieldType, recipientType) =>
  FIELD_TYPES[fieldType]?.allowedFor.includes(recipientType) ?? false;
