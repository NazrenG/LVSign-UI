/**
 * DEVELOPMENT DATA — used only by devSigningAdapter.js.
 * Shaped like the future GET /api/signing/{envelopeId} response.
 * Field rectangles match the sample PDFs in /public/samples.
 */
const A4 = { width: 595, height: 842 };
const a4Pages = (count) =>
  Array.from({ length: count }, (_, index) => ({
    pageNumber: index + 1,
    ...A4,
  }));

/** Envelope ids (server-style). */
export const DEV_ENVELOPES = {
  LEAVE_REQUEST: "8c3e1f52-6a0d-4b7e-9f21-3d5a7c9e0b14", // ready · last signer → envelope completes
  OVERTIME: "b71d4a09-2e6c-4f83-a5d0-9c1e7b3f6a28", // ready · director still to sign afterwards
  NOT_YOUR_TURN: "4e9a2c71-0b5d-4c3f-8e16-a7d2f9b0c535",
  EXPIRED: "d02f6b8e-7c31-4a59-b4e7-1f8c3a6d9e42",
  VOIDED: "f5a8d3c0-9e72-4b16-8d4a-2c7e0b9f1a63",
  ALREADY_COMPLETED: "1c7e9b24-5f08-4d3a-9b6e-e3a1c8f0d754",
  ACCESS_DENIED: "9a4f2e6d-3b81-4c75-a0d9-5e2b7c1f8a96",
};

/** Older links (Home "Sign document") use mock agreement ids. Dev only. */
export const LEGACY_IDS = {
  "leave-am": DEV_ENVELOPES.LEAVE_REQUEST,
};

const ME = {
  id: "5b2e8f14-0c7a-4d93-b6e1-a3f9c2d07e58",
  name: "Nazrin Guliyeva",
  email: "nazrin.guliyeva@lvlogistics.az",
};

const recipient = (status, routingOrder, recipientType = "signer") => ({
  ...ME,
  status,
  recipientType,
  routingOrder,
});

const sender = (name, email) => ({ name, email });

/** A department stamp drawn as SVG, so the demo needs no image files. */
function stampSvg(top, bottom) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <g fill="none" stroke="#233d8c" stroke-width="5"><circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="64" stroke-width="2.5"/></g>
  <defs><path id="t" d="M100,100 m-78,0 a78,78 0 1,1 156,0"/><path id="b" d="M100,100 m-80,0 a80,80 0 0,0 160,0"/></defs>
  <g fill="#233d8c" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2">
    <text font-size="17"><textPath href="#t" startOffset="50%" text-anchor="middle">${top}</textPath></text>
    <text font-size="15"><textPath href="#b" startOffset="50%" text-anchor="middle">${bottom}</textPath></text>
    <text x="100" y="112" font-size="34" font-style="italic" text-anchor="middle">LV</text>
  </g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const SAVED_SIGNATURES = [
  {
    id: "c4a1e7d2-93b0-4f58-8e26-7d0b5f1a9c33",
    label: "Typed · Great Vibes",
    method: "typed",
    typedText: ME.name,
    fontKey: "great-vibes",
  },
];
const SAVED_INITIALS = [];
const STAMPS = [
  {
    id: "e6f20b9d-4a71-4c3e-95d8-0b7a2c4f1e86",
    name: "HR Department",
    imageUrl: stampSvg("LV LOGISTICS", "HR DEPARTMENT"),
  },
  {
    id: "27c9d5a1-6e3f-4b08-a14d-9f8e2b6c0d53",
    name: "Operations — Koroglu Depot",
    imageUrl: stampSvg("LV LOGISTICS", "KOROGLU DEPOT"),
  },
];

const field = (
  id,
  documentId,
  fieldType,
  label,
  pageNumber,
  rect,
  extra = {},
) => ({
  id,
  documentId,
  recipientId: ME.id,
  recipientName: ME.name,
  fieldType,
  label,
  pageNumber,
  ...rect,
  isRequired: true,
  value: null,
  options: [],
  completedAt: null,
  ...extra,
});

const othersSignature = (
  id,
  documentId,
  recipientId,
  recipientName,
  rect,
  typedText,
  fontKey,
  completedAt,
) => ({
  id,
  documentId,
  recipientId,
  recipientName,
  fieldType: "signature",
  label: "Signature",
  pageNumber: 1,
  ...rect,
  isRequired: true,
  value: { method: "typed", typedText, fontKey },
  options: [],
  completedAt,
});

// ---------------------------------------------------------------- leave request (2 documents)
const LEAVE_DOC = "a7f3c9e1-2b54-4d86-9e0a-61c8d4b2f7e9";
const CHECKLIST_DOC = "3d8b1f6c-7e29-4a05-b3c4-e9f0a2d6c815";

const leaveRequest = {
  envelopeId: DEV_ENVELOPES.LEAVE_REQUEST,
  subject: "Leave Request — Aysel Mammadova",
  message:
    "Please confirm the leave balance and the depot rota before signing. Farid has already approved the dates.",
  envelopeStatus: "inProgress",
  expiresAt: "2026-11-07T18:00:00+04:00",
  sender: sender("Aysel Mammadova", "aysel.mammadova@lvlogistics.az"),
  recipient: recipient("active", 3),
  remainingRecipients: 0,
  documents: [
    {
      id: LEAVE_DOC,
      fileName: "leave-request.pdf",
      order: 1,
      pageCount: 1,
      fileUrl: "/samples/leave-request.pdf",
      pages: a4Pages(1),
    },
    {
      id: CHECKLIST_DOC,
      fileName: "annual-leave-hr-checklist.pdf",
      order: 2,
      pageCount: 2,
      fileUrl: "/samples/leave-hr-checklist.pdf",
      pages: a4Pages(2),
    },
  ],
  fields: [
    othersSignature(
      "0e5d7a93-1c48-4f2b-8d6e-b9a0c3f17e24",
      LEAVE_DOC,
      "6a1f3e8b-0d27-4c95-a4e3-2b8d7f0c9e16",
      "Aysel Mammadova",
      { x: 0.1008, y: 0.4731, width: 0.3529, height: 0.0523 },
      "Aysel Mammadova",
      "great-vibes",
      "2026-10-22T14:06:00+04:00",
    ),
    othersSignature(
      "8b2c4e61-7f09-4a3d-b5e8-d1c6a9f0e472",
      LEAVE_DOC,
      "f3b9d2c7-5e14-4a86-9c0b-7e2a1d6f8b39",
      "Farid Aliyev",
      { x: 0.5462, y: 0.4731, width: 0.3529, height: 0.0523 },
      "Farid Aliyev",
      "mrs-saint-delafield",
      "2026-10-23T08:51:00+04:00",
    ),
    field(
      "d9e4a2b7-6c13-4f80-a5d1-0b8e3c7f2a64",
      LEAVE_DOC,
      "signature",
      "HR signature",
      1,
      { x: 0.1008, y: 0.6037, width: 0.3529, height: 0.0523 },
    ),
    field(
      "47c1f8e3-9a25-4d6b-b0e7-c3d8a1f5e920",
      LEAVE_DOC,
      "dateSigned",
      "Date approved",
      1,
      { x: 0.5462, y: 0.6037, width: 0.2605, height: 0.0214 },
    ),
    field(
      "b0e6d3a9-4f72-4c18-9a5e-7d1c2b8f6e03",
      CHECKLIST_DOC,
      "number",
      "Remaining balance (days)",
      1,
      { x: 0.6723, y: 0.1974, width: 0.2269, height: 0.0238 },
    ),
    field(
      "6f2a9c4e-3d81-4b57-a0e6-e8b1d5c7f392",
      CHECKLIST_DOC,
      "dropdown",
      "Balance checked in",
      1,
      { x: 0.5546, y: 0.2377, width: 0.3445, height: 0.0238 },
      { options: ["HR system", "Paper leave card", "Payroll export"] },
    ),
    field(
      "c8d5b1f7-2e94-4a63-b7c0-1f9e4a2d8b56",
      CHECKLIST_DOC,
      "checkbox",
      "Rota updated",
      1,
      { x: 0.6723, y: 0.2793, width: 0.0269, height: 0.019 },
    ),
    field(
      "2a7e0c95-8b36-4d1f-9e42-a5c6f3b8d071",
      CHECKLIST_DOC,
      "radio",
      "Payroll notification",
      1,
      { x: 0.1008, y: 0.3446, width: 0.5714, height: 0.0499 },
      { options: ["Notify payroll now", "Include in month-end run"] },
    ),
    field(
      "e5b3f9d2-0c67-4a81-8f4b-6d2e9a1c7b58",
      CHECKLIST_DOC,
      "text",
      "Note for the file",
      1,
      { x: 0.1008, y: 0.4278, width: 0.7983, height: 0.0261 },
      { isRequired: false },
    ),
    field(
      "91f4c6a8-5d23-4e7b-b1a9-0e3f8c2d6a47",
      CHECKLIST_DOC,
      "initials",
      "HR initials",
      2,
      { x: 0.1008, y: 0.2178, width: 0.1513, height: 0.0428 },
    ),
    field(
      "7d0b2e58-c4a9-4f36-8e1d-b6a3f9c0e214",
      CHECKLIST_DOC,
      "stamp",
      "Department stamp",
      2,
      { x: 0.5462, y: 0.2178, width: 0.2017, height: 0.1069 },
      { isRequired: false },
    ),
  ],
  savedSignatures: SAVED_SIGNATURES,
  savedInitials: SAVED_INITIALS,
  stamps: STAMPS,
};

// ---------------------------------------------------------------- overtime (director signs after me)
const OT_DOC = "5e9c2a07-b3f1-4d68-a24e-8c0d7b1f9e35";
const overtime = {
  envelopeId: DEV_ENVELOPES.OVERTIME,
  subject: "Overtime Approval — Week 41",
  message: "",
  envelopeStatus: "inProgress",
  expiresAt: "2026-11-02T18:00:00+04:00",
  sender: sender("Rashad Mammadli", "rashad.mammadli@lvlogistics.az"),
  recipient: recipient("viewed", 2),
  remainingRecipients: 1,
  documents: [
    {
      id: OT_DOC,
      fileName: "overtime-approval-week-41.pdf",
      order: 1,
      pageCount: 1,
      fileUrl: "/samples/overtime-approval.pdf",
      pages: a4Pages(1),
    },
  ],
  fields: [
    othersSignature(
      "3c6f1a8d-e2b7-4950-a8c3-d5e0b9f2a716",
      OT_DOC,
      "a2d7f0c4-9b38-4e15-8f6a-c1e4b7d3a982",
      "Rashad Mammadli",
      { x: 0.1008, y: 0.4601, width: 0.3529, height: 0.0523 },
      "R. Mammadli",
      "great-vibes",
      "2026-10-26T17:40:00+04:00",
    ),
    field(
      "f8a2d6c1-3b97-4e05-9d4f-2a7c0e8b5d63",
      OT_DOC,
      "number",
      "Approved overtime hours",
      1,
      { x: 0.5042, y: 0.377, width: 0.1681, height: 0.0238 },
    ),
    field(
      "0b7e4c93-a5d2-4f18-b6c0-9e3a1f7d2c85",
      OT_DOC,
      "signature",
      "Operations manager signature",
      1,
      { x: 0.5462, y: 0.4601, width: 0.3529, height: 0.0523 },
    ),
  ],
  savedSignatures: SAVED_SIGNATURES,
  savedInitials: SAVED_INITIALS,
  stamps: STAMPS,
};

// ---------------------------------------------------------------- state scenarios
const scenario = (envelopeId, envelopeStatus, status, extra = {}) => ({
  ...overtime,
  envelopeId,
  envelopeStatus,
  recipient: recipient(status, 2),
  ...extra,
});

export const buildSeed = () => ({
  [leaveRequest.envelopeId]: leaveRequest,
  [overtime.envelopeId]: overtime,
  [DEV_ENVELOPES.NOT_YOUR_TURN]: scenario(
    DEV_ENVELOPES.NOT_YOUR_TURN,
    "inProgress",
    "pending",
    { subject: "Vendor Invoice INV-2291 Approval" },
  ),
  [DEV_ENVELOPES.EXPIRED]: scenario(
    DEV_ENVELOPES.EXPIRED,
    "expired",
    "active",
    {
      subject: "Training Attendance — Fire Safety Q3",
      expiresAt: "2026-09-12T00:00:00+04:00",
    },
  ),
  [DEV_ENVELOPES.VOIDED]: scenario(DEV_ENVELOPES.VOIDED, "voided", "canceled", {
    subject: "Vendor Invoice INV-2274 Approval",
  }),
  [DEV_ENVELOPES.ALREADY_COMPLETED]: scenario(
    DEV_ENVELOPES.ALREADY_COMPLETED,
    "inProgress",
    "completed",
    { subject: "Night Shift Rota — Koroglu Depot" },
  ),
});
