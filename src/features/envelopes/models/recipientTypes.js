import { Copy, Eye, PenLine, ShieldCheck } from "lucide-react";

/** @typedef {"signer"|"approver"|"viewer"|"copy"} RecipientType */
export const RECIPIENT_TYPE = {
  SIGNER: "signer",
  APPROVER: "approver",
  VIEWER: "viewer",
  COPY: "copy",
};

/**
 * What each recipient type does. `canOwnFields` decides whether fields can be
 * assigned to it; `needsSignature` whether it must have a signature field.
 */
export const RECIPIENT_TYPES = {
  [RECIPIENT_TYPE.SIGNER]: {
    label: "Signer",
    description: "Fills in and signs the fields assigned to them",
    icon: PenLine,
    canOwnFields: true,
    needsSignature: true,
  },
  [RECIPIENT_TYPE.APPROVER]: {
    label: "Approver",
    description: "Approves the document; can initial or stamp",
    icon: ShieldCheck,
    canOwnFields: true,
    needsSignature: false,
  },
  [RECIPIENT_TYPE.VIEWER]: {
    label: "Viewer",
    description: "Must open the document, signs nothing",
    icon: Eye,
    canOwnFields: false,
    needsSignature: false,
  },
  [RECIPIENT_TYPE.COPY]: {
    label: "Receives a copy",
    description: "Gets the completed document by email",
    icon: Copy,
    canOwnFields: false,
    needsSignature: false,
  },
};

export const RECIPIENT_TYPE_OPTIONS = Object.entries(RECIPIENT_TYPES).map(
  ([value, { label }]) => ({ value, label }),
);
