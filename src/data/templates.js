import { SIGNER_ROLES } from "./templateRoles";

/* ---------- defaults ---------- */

const DEFAULT_ACCESS = {
  staff: { use: true, edit: false },
  hr: { use: true, edit: true },
  finance: { use: true, edit: false },
  operations: { use: true, edit: false },
  admin: { use: true, edit: true },
};

const DEFAULT_RULES = {
  onDecline: "Stop the route and notify the sender",
  onComplete: "Archive only",
  skipSelfApproval: false,
  requireComment: false,
};

const DEFAULT_EXPIRY = {
  expiresAfterDays: 14,
  signerDays: 3,
  validFor: "No end date",
  onExpire: "expire",
  remindersEnabled: true,
  firstReminderDays: 2,
  repeatEveryDays: 2,
  maxReminders: 3,
  escalateAfterDays: 5,
  quietHours: true,
  channels: { email: true, inApp: true },
};

/** A signer step with sensible defaults; only `roleId` is required. */
export function createRoleStep(roleId, overrides = {}) {
  return {
    id: roleId,
    roleId,
    action: "approve",
    resolver: SIGNER_ROLES[roleId].resolver,
    delegate: "No",
    timeToActDays: 3,
    ...overrides,
  };
}

/** Every signer role gets a signature + date signed field. */
const createSigningFields = (roles) =>
  roles.flatMap((role, index) => [
    {
      id: `${role.id}-signature`,
      label: "Signature",
      type: "signature",
      filledBy: role.id,
      required: true,
      dataKey: `approvals[${index}]`,
    },
    {
      id: `${role.id}-date`,
      label: "Date signed",
      type: "dateSigned",
      filledBy: role.id,
      required: true,
      dataKey: `approvals[${index}].date`,
    },
  ]);

/** Builds a full template from the few fields that differ between templates. */
function createTemplate({
  roles: roleIds = [],
  roleSteps,
  fields = [],
  ...rest
}) {
  const roles = roleSteps ?? roleIds.map((roleId) => createRoleStep(roleId));
  return {
    version: 1,
    ownerId: "nk",
    updatedBy: "nk",
    language: "English",
    sourceDocument: { name: `${rest.id}.pdf`, pages: 1 },
    access: DEFAULT_ACCESS,
    allowRouteChange: true,
    hidden: false,
    signingOrder: "sequential",
    copyRecipients: [],
    rules: DEFAULT_RULES,
    expiry: DEFAULT_EXPIRY,
    ...rest,
    roles,
    fields: [...fields, ...createSigningFields(roles)],
  };
}

/* ---------- the fully specified example from the design ---------- */

const annualLeaveRoles = [
  createRoleStep("dh", { delegate: "Yes, to deputy head", timeToActDays: 3 }),
  createRoleStep("hr", { timeToActDays: 2 }),
  createRoleStep("em", { action: "acknowledge", timeToActDays: 5 }),
];

const annualLeave = createTemplate({
  id: "annual-leave-request",
  name: "Annual Leave Request",
  description:
    "Request paid annual leave; approved by the department head and HR, then acknowledged by the employee.",
  category: "HR",
  docPrefix: "HR-LEAVE",
  version: 4,
  updatedAt: "2026-09-12",
  sourceDocument: { name: "annual-leave-request_v4.pdf", pages: 2 },
  access: { ...DEFAULT_ACCESS, finance: { use: false, edit: false } },
  copyRecipients: ["Payroll team"],
  rules: {
    onDecline: "Stop the route and notify the sender",
    onComplete: "Send a copy to Payroll and archive",
    skipSelfApproval: true,
    requireComment: false,
  },
  expiry: { ...DEFAULT_EXPIRY, validFor: "Until the leave ends" },
  stats: {
    avgCompletionDays: 1.4,
    timesUsed: 214,
    usesThisMonth: 29,
    completedBeforeExpiry: 96,
  },
  roleSteps: annualLeaveRoles,
  intro:
    "I request annual leave for the dates below. My duties during this period have been handed over as noted.",
  outro:
    "Approval confirms the leave balance has been checked and the rota updated. The employee signs last to acknowledge the approved dates.",
  fields: [
    {
      id: "employee-name",
      label: "Employee name",
      type: "fullName",
      filledBy: "sender",
      required: true,
      dataKey: "employee.full_name",
    },
    {
      id: "department",
      label: "Department",
      type: "text",
      filledBy: "hrSystem",
      required: true,
      dataKey: "employee.department",
    },
    {
      id: "leave-type",
      label: "Leave type",
      type: "dropdown",
      filledBy: "sender",
      required: true,
      dataKey: "leave.type",
      apiField: "LeaveRequest.Type",
      options: [
        "Annual leave",
        "Unpaid leave",
        "Study leave",
        "Compassionate leave",
      ],
    },
    {
      id: "from",
      label: "From",
      type: "date",
      filledBy: "sender",
      required: true,
      dataKey: "leave.start_date",
    },
    {
      id: "to",
      label: "To",
      type: "date",
      filledBy: "sender",
      required: true,
      dataKey: "leave.end_date",
    },
    {
      id: "working-days",
      label: "Working days",
      type: "number",
      filledBy: "calculated",
      required: true,
      dataKey: "leave.working_days",
    },
    {
      id: "cover",
      label: "Cover arranged with",
      type: "text",
      filledBy: "sender",
      required: false,
      dataKey: "leave.cover_person",
    },
  ],
});

/* ---------- the rest of the catalogue ---------- */

const stats = (
  avgCompletionDays,
  timesUsed,
  usesThisMonth,
  completedBeforeExpiry = 94,
) => ({
  avgCompletionDays,
  timesUsed,
  usesThisMonth,
  completedBeforeExpiry,
});

export const TEMPLATES = [
  annualLeave,
  createTemplate({
    id: "equipment-handover",
    name: "Equipment Handover Form",
    description:
      "Record the transfer of vehicles, forklifts or tools between staff, with condition notes and serial numbers.",
    category: "Operations",
    docPrefix: "OPS-EQUIP",
    updatedAt: "2026-09-18",
    stats: stats(0.8, 167, 18),
    roles: ["wl", "om", "em"],
  }),
  createTemplate({
    id: "nda-internal",
    name: "Non-Disclosure Agreement - Internal",
    description:
      "Confidentiality terms for staff given access to tender, pricing or passenger data.",
    category: "Legal",
    docPrefix: "LEG-NDA",
    updatedAt: "2026-09-02",
    stats: stats(2.1, 58, 6),
    roles: ["lc", "em"],
  }),
  createTemplate({
    id: "vendor-invoice",
    name: "Vendor Invoice Approval",
    description:
      "Approve supplier invoices against the purchase order before payment is scheduled.",
    category: "Finance",
    docPrefix: "FIN-INV",
    updatedAt: "2026-09-21",
    stats: stats(1.9, 342, 41),
    roles: ["fo", "dh", "fm"],
  }),
  createTemplate({
    id: "expense-claim",
    name: "Expense Reimbursement Claim",
    description:
      "Claim back work expenses with receipts attached; checked by the line manager and Finance.",
    category: "Finance",
    docPrefix: "FIN-EXP",
    updatedAt: "2026-08-15",
    stats: stats(2.6, 129, 14),
    roles: ["lm", "fo"],
  }),
  createTemplate({
    id: "night-shift-rota",
    name: "Night Shift Rota Approval",
    description:
      "Confirm the weekly night shift rota for a depot before it is published to drivers.",
    category: "Operations",
    docPrefix: "OPS-ROTA",
    updatedAt: "2026-09-25",
    stats: stats(1.1, 96, 12),
    roles: ["ss", "om", "hr"],
  }),
  createTemplate({
    id: "it-access",
    name: "IT Access Request",
    description:
      "Request access to systems, shared drives or VPN; approved by the line manager and IT security.",
    category: "IT & Admin",
    docPrefix: "IT-ACCESS",
    updatedAt: "2026-09-10",
    stats: stats(0.6, 188, 22),
    roles: ["lm", "is"],
  }),
  createTemplate({
    id: "onboarding-checklist",
    name: "Employee Onboarding Checklist",
    description:
      "Confirm contract, induction, safety briefing and equipment issue for a new starter.",
    category: "HR",
    docPrefix: "HR-ONB",
    updatedAt: "2026-08-28",
    stats: stats(3.2, 41, 5),
    roles: ["hr", "lm", "em"],
  }),
  createTemplate({
    id: "policy-acknowledgement",
    name: "Policy Acknowledgement",
    description:
      "Staff confirm they have read and understood an updated internal policy.",
    category: "Legal",
    docPrefix: "LEG-POL",
    updatedAt: "2026-09-05",
    stats: stats(0.4, 305, 36),
    roleSteps: [createRoleStep("em", { action: "acknowledge" })],
  }),
  createTemplate({
    id: "overtime-approval",
    name: "Overtime Approval",
    description: "Approve planned overtime hours before the week starts.",
    category: "HR",
    docPrefix: "HR-OT",
    updatedAt: "2026-09-20",
    stats: stats(0.9, 77, 9),
    roles: ["lm", "hr"],
  }),
  createTemplate({
    id: "probation-review",
    name: "Probation Review",
    description:
      "Record the outcome of a probation period and confirm the employment decision.",
    category: "HR",
    docPrefix: "HR-PROB",
    updatedAt: "2026-07-30",
    stats: stats(4.1, 23, 2),
    roles: ["lm", "hr", "em"],
  }),
  createTemplate({
    id: "petty-cash",
    name: "Petty Cash Request",
    description: "Request a small cash advance for depot purchases.",
    category: "Finance",
    docPrefix: "FIN-CASH",
    updatedAt: "2026-09-01",
    stats: stats(1.2, 64, 7),
    roles: ["lm", "fo"],
  }),
  createTemplate({
    id: "fuel-supply-addendum",
    name: "Fuel Supply Addendum",
    description:
      "Change the fuel allocation or delivery window for a depot; approved by Operations and Finance.",
    category: "Operations",
    docPrefix: "OPS-FUEL",
    updatedAt: "2026-09-22",
    stats: stats(1.6, 31, 4),
    roles: ["om", "fo"],
  }),
  createTemplate({
    id: "asset-return",
    name: "Asset Return Form",
    description:
      "Confirm a leaver has returned their laptop, phone, badge and keys.",
    category: "IT & Admin",
    docPrefix: "IT-ASSET",
    updatedAt: "2026-08-19",
    stats: stats(0.7, 52, 3),
    roles: ["lm", "is"],
  }),
];

/** Starting point for "Create template". */
export function createBlankTemplate() {
  return createTemplate({
    id: "new",
    name: "Untitled template",
    description: "",
    category: "HR",
    docPrefix: "",
    version: 0,
    updatedAt: new Date().toISOString().slice(0, 10),
    stats: stats(0, 0, 0, 0),
    roleSteps: [createRoleStep("lm")],
  });
}
