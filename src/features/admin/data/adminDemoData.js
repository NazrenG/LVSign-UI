/*
 * DEMO DATA for the Admin UI prototype.
 * Not loaded from or written to the backend — replace with the Admin API
 * once its contract is confirmed.
 */

export const DEMO_DEPARTMENTS = [
  {
    id: "dep-mgmt",
    name: "Management",
    description: "Directors and leadership.",
  },
  {
    id: "dep-ops",
    name: "Operations",
    description: "Depots, shifts and warehouse operations.",
  },
  {
    id: "dep-fin",
    name: "Finance",
    description: "Accounting, payments and budgeting.",
  },
  {
    id: "dep-log",
    name: "Logistics",
    description: "Fleet, routing and transport planning.",
  },
  {
    id: "dep-dev",
    name: "System Developer",
    description: "Internal software and IT systems.",
  },
  {
    id: "dep-hr",
    name: "Human Resources",
    description: "Hiring, contracts and staff records.",
  },
  { id: "dep-legal", name: "Legal", description: "Contracts and compliance." },
];

const ALL_ON = null; // resolved to "every prototype permission" in the hook

export const DEMO_PROFILES = [
  {
    id: "prof-admin",
    name: "Administrator",
    description: "Full access, including the Admin workspace.",
    permissions: ALL_ON,
  },
  {
    id: "prof-manager",
    name: "Department manager",
    description:
      "Sends agreements, manages templates and sees department activity.",
    permissions: [
      "agreements.send",
      "agreements.viewAll",
      "templates.use",
      "templates.edit",
      "templates.publish",
      "users.view",
      "stamps.use",
      "reporting.view",
    ],
  },
  {
    id: "prof-sender",
    name: "Sender",
    description: "Sends agreements from published templates.",
    permissions: ["agreements.send", "templates.use", "stamps.use"],
  },
  {
    id: "prof-signer",
    name: "Signer only",
    description: "Signs documents sent to them. Cannot send agreements.",
    permissions: [],
  },
];

export const DEMO_USERS = [
  {
    id: "u-01",
    name: "Nazrin Guliyeva",
    email: "nazrin.guliyeva@lv-logistics.com",
    departmentId: "dep-dev",
    profileId: "prof-admin",
    active: true,
    identity: "linked",
    addedAt: "2026-09-02",
  },
  {
    id: "u-02",
    name: "Orkhan Guliyev",
    email: "orkhan.guliyev@lv-logistics.com",
    departmentId: "dep-mgmt",
    profileId: "prof-admin",
    active: true,
    identity: "linked",
    addedAt: "2026-09-02",
  },
  {
    id: "u-03",
    name: "Farid Aliyev",
    email: "farid.aliyev@lv-logistics.com",
    departmentId: "dep-ops",
    profileId: "prof-manager",
    active: true,
    identity: "linked",
    addedAt: "2026-09-04",
  },
  {
    id: "u-04",
    name: "Leyla Hasanova",
    email: "leyla.hasanova@lv-logistics.com",
    departmentId: "dep-fin",
    profileId: "prof-manager",
    active: true,
    identity: "linked",
    addedAt: "2026-09-04",
  },
  {
    id: "u-05",
    name: "Rashad Mammadli",
    email: "rashad.mammadli@lv-logistics.com",
    departmentId: "dep-ops",
    profileId: "prof-sender",
    active: true,
    identity: "linked",
    addedAt: "2026-09-10",
  },
  {
    id: "u-06",
    name: "Aysel Mammadova",
    email: "aysel.mammadova@lv-logistics.com",
    departmentId: "dep-ops",
    profileId: "prof-signer",
    active: true,
    identity: "linked",
    addedAt: "2026-09-10",
  },
  {
    id: "u-07",
    name: "Tural Ismayilov",
    email: "tural.ismayilov@lv-logistics.com",
    departmentId: "dep-log",
    profileId: "prof-sender",
    active: true,
    identity: "pending",
    addedAt: "2026-09-18",
  },
  {
    id: "u-08",
    name: "Gunel Rzayeva",
    email: "gunel.rzayeva@lv-logistics.com",
    departmentId: "dep-hr",
    profileId: "prof-manager",
    active: true,
    identity: "linked",
    addedAt: "2026-09-18",
  },
  {
    id: "u-09",
    name: "Elvin Huseynov",
    email: "elvin.huseynov@lv-logistics.com",
    departmentId: "dep-log",
    profileId: "prof-signer",
    active: true,
    identity: "notLinked",
    addedAt: "2026-10-01",
  },
  {
    id: "u-10",
    name: "Sevinj Abbasova",
    email: "sevinj.abbasova@lv-logistics.com",
    departmentId: "dep-legal",
    profileId: "prof-sender",
    active: true,
    identity: "linked",
    addedAt: "2026-10-03",
  },
  {
    id: "u-11",
    name: "Kamran Najafov",
    email: "kamran.najafov@lv-logistics.com",
    departmentId: "dep-fin",
    profileId: "prof-signer",
    active: false,
    identity: "linked",
    addedAt: "2026-09-12",
  },
  {
    id: "u-12",
    name: "Narmin Karimova",
    email: "narmin.karimova@lv-logistics.com",
    departmentId: "dep-ops",
    profileId: "prof-signer",
    active: true,
    identity: "pending",
    addedAt: "2026-10-20",
  },
  {
    id: "u-13",
    name: "Vugar Safarov",
    email: "vugar.safarov@lv-logistics.com",
    departmentId: "dep-log",
    profileId: "prof-signer",
    active: false,
    identity: "notLinked",
    addedAt: "2026-10-22",
  },
  {
    id: "u-14",
    name: "Lala Mirzayeva",
    email: "lala.mirzayeva@lv-logistics.com",
    departmentId: "dep-hr",
    profileId: "prof-signer",
    active: true,
    identity: "linked",
    addedAt: "2026-11-03",
  },
];

/** Simple inline SVG stamps so the demo has previews without real uploads. */
function roundStamp(color, top, bottom) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="none" stroke="${color}"><circle cx="100" cy="100" r="92" stroke-width="5"/><circle cx="100" cy="100" r="66" stroke-width="2"/></g><defs><path id="t" d="M100 100 m-78 0 a78 78 0 1 1 156 0"/><path id="b" d="M100 100 m-80 0 a80 80 0 0 0 160 0"/></defs><g fill="${color}" font-family="Arial, sans-serif" font-weight="700"><text font-size="17" letter-spacing="2"><textPath href="#t" startOffset="50%" text-anchor="middle">${top}</textPath></text><text font-size="15" letter-spacing="2"><textPath href="#b" startOffset="50%" text-anchor="middle">${bottom}</textPath></text><text x="100" y="112" font-size="34" text-anchor="middle" font-style="italic">LV</text></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function rectStamp(color, line1, line2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 110"><rect x="4" y="4" width="252" height="102" rx="6" fill="none" stroke="${color}" stroke-width="5"/><g fill="${color}" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle"><text x="130" y="52" font-size="30" letter-spacing="3">${line1}</text><text x="130" y="84" font-size="16" letter-spacing="2">${line2}</text></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const DEMO_STAMPS = [
  {
    id: "st-company",
    name: "LV Logistics company seal",
    description: "Official company seal for contracts and agreements.",
    imageUrl: roundStamp("#233d8c", "LV LOGISTICS LLC", "BAKU · AZERBAIJAN"),
    scope: "company",
    assignedUserIds: [],
    active: true,
    createdAt: "2026-09-05",
    updatedAt: "2026-10-14",
    updatedBy: "Nazrin Guliyeva",
  },
  {
    id: "st-finance",
    name: "Finance — Approved",
    description: "Approval stamp for invoices and payment requests.",
    imageUrl: rectStamp("#1d6b4f", "APPROVED", "LV LOGISTICS · FINANCE"),
    scope: "users",
    assignedUserIds: ["u-04", "u-11"],
    active: true,
    createdAt: "2026-09-20",
    updatedAt: "2026-10-02",
    updatedBy: "Orkhan Guliyev",
  },
  {
    id: "st-hr",
    name: "HR department",
    description: "Used on employment contracts and staff letters.",
    imageUrl: roundStamp("#7a3e8a", "HUMAN RESOURCES", "LV LOGISTICS"),
    scope: "users",
    assignedUserIds: ["u-08"],
    active: true,
    createdAt: "2026-10-08",
    updatedAt: "2026-10-08",
    updatedBy: "Nazrin Guliyeva",
  },
  {
    id: "st-received",
    name: "Received — Koroglu Depot",
    description: "",
    imageUrl: rectStamp("#b42318", "RECEIVED", "KOROGLU DEPOT"),
    scope: "users",
    assignedUserIds: ["u-03", "u-05", "u-06"],
    active: false,
    createdAt: "2026-09-28",
    updatedAt: "2026-11-01",
    updatedBy: "Farid Aliyev",
  },
];

export const DEFAULT_AGREEMENT_RULES = {
  expirationDays: 30,
  reminderInterval: "3",
  allowedDocumentTypes: ["pdf", "docx"],
  sendersCanOverrideDefaults: true,
  defaultRouting: "sequential",
  allowDecline: true,
  requireDeclineReason: true,
  allowReassign: false,
  allowTypedSignature: true,
  allowDrawnSignature: true,
  allowUploadedSignature: false,
};
