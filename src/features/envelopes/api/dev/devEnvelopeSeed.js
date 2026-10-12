/**
 * DEVELOPMENT DATA — used only by devEnvelopeAdapter.js.
 * Shaped like the transport DTO (see mappers/envelopeMapper.js), with
 * server-style UUIDs. Never import this from components or hooks.
 */
const A4 = { width: 595, height: 842 };

const ENVELOPE_ID = "6d0f3c2a-8b1e-4c57-9a41-2f7e5b9c0d13";
const MAIN_DOCUMENT_ID = "b3e2a9c4-1f6d-4e8b-8c25-7a1d9e3f5b60";
const APPENDIX_DOCUMENT_ID = "e8c71d05-3a94-4b2f-b6de-0c4f8a2e1d97";
const FARID_ID = "0a9d4e6b-52c3-4f18-9e7a-d1b38c6f2a45";
const LEYLA_ID = "4c18b7e2-9d05-4a6f-8b31-e2f9a07c5d84";
const RASHAD_ID = "93f6a1d8-7e24-4c0b-a5d9-1b8e4f7c2063";
const PAYROLL_ID = "c5e0b3f9-1a7d-4d26-9c84-6f2a8e1b0d37";

const recipient = (
  id,
  displayName,
  email,
  roleName,
  recipientType,
  routingOrder,
) => ({
  id,
  displayName,
  email,
  roleName,
  recipientType,
  routingOrder,
  isRequired: true,
  status: "created",
  permissions: {
    allowSenderEditRecipient: true,
    allowSenderDeleteRecipient: true,
    allowSenderChangeRoutingOrder: true,
  },
});

const field = (
  id,
  documentId,
  recipientId,
  type,
  pageNumber,
  rect,
  label = "",
) => ({
  id,
  documentId,
  recipientId,
  type,
  pageNumber,
  label,
  isRequired: true,
  ...rect,
});

/** Draft envelopes keyed by id. */
export const buildSeedEnvelopes = (sender) => ({
  [ENVELOPE_ID]: {
    id: ENVELOPE_ID,
    title: "Fuel Supply Addendum — Depot 4",
    status: "draft",
    routingMode: "sequential",
    sender,
    emailSubject: "Please sign: Fuel Supply Addendum — Depot 4",
    emailMessage: "Please review the Depot 4 fuel changes before Friday.",
    dueDate: "2026-10-23",
    reminderEveryDays: 2,
    updatedAt: "2026-10-12T09:20:00",
    documents: [
      {
        id: MAIN_DOCUMENT_ID,
        name: "fuel-supply-addendum.pdf",
        fileUrl: "/samples/fuel-supply-addendum.pdf",
        order: 1,
        pages: [{ pageNumber: 1, ...A4 }],
      },
      {
        id: APPENDIX_DOCUMENT_ID,
        name: "appendix-a-delivery-schedule.pdf",
        fileUrl: "/samples/delivery-schedule.pdf",
        order: 2,
        pages: [
          { pageNumber: 1, ...A4 },
          { pageNumber: 2, ...A4 },
        ],
      },
    ],
    recipients: [
      recipient(
        FARID_ID,
        "Farid Aliyev",
        "farid.aliyev@lvlogistics.az",
        "Operations manager",
        "signer",
        1,
      ),
      recipient(
        LEYLA_ID,
        "Leyla Hasanova",
        "leyla.hasanova@lvlogistics.az",
        "Finance",
        "signer",
        2,
      ),
      recipient(
        RASHAD_ID,
        "Rashad Mammadli",
        "rashad.mammadli@lvlogistics.az",
        "Shift supervisor",
        "approver",
        2,
      ),
      recipient(
        PAYROLL_ID,
        "Payroll team",
        "payroll@lvlogistics.az",
        "",
        "copy",
        3,
      ),
    ],
    fields: [
      field(
        "1e7c9a20-4b3d-4f6e-8a15-c2d9b0e7f341",
        MAIN_DOCUMENT_ID,
        FARID_ID,
        "signature",
        1,
        { x: 0.1, y: 0.845, width: 0.33, height: 0.055 },
      ),
      field(
        "7b2f05d1-9c8e-4a37-b6f4-e1a3d8c9024b",
        MAIN_DOCUMENT_ID,
        FARID_ID,
        "dateSigned",
        1,
        { x: 0.1, y: 0.912, width: 0.18, height: 0.03 },
      ),
      field(
        "a4d81e39-62f7-4c05-9b1e-3f8c7d2a6e50",
        MAIN_DOCUMENT_ID,
        LEYLA_ID,
        "signature",
        1,
        { x: 0.546, y: 0.845, width: 0.33, height: 0.055 },
      ),
      field(
        "5f93c6e8-0d2a-4b71-a8c4-9e1f6b3d7a28",
        APPENDIX_DOCUMENT_ID,
        RASHAD_ID,
        "initials",
        1,
        { x: 0.78, y: 0.9, width: 0.1, height: 0.04 },
      ),
      field(
        "d6a0b4f2-8e15-4c9d-b7a3-2c5e9f1d8b64",
        APPENDIX_DOCUMENT_ID,
        RASHAD_ID,
        "initials",
        2,
        { x: 0.1, y: 0.845, width: 0.1, height: 0.04 },
      ),
    ],
    routingRules: [],
  },
});

/**
 * Older screens (Home, Agreements) still link with mock agreement ids.
 * Development-only shim; real agreements will carry real envelope ids.
 */
export const LEGACY_DOCUMENT_IDS = {
  "fuel-depot-4": ENVELOPE_ID,
};
