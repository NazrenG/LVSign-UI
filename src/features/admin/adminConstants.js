/*
 * Admin module constants. Everything here is presentation-only until the
 * Admin API contract is confirmed with the backend.
 */

export const ACCOUNT_STATUS = Object.freeze({
  active: "active",
  inactive: "inactive",
});

/** Read-only Microsoft identity association, as reported by demo data. */
export const IDENTITY_STATUS = Object.freeze({
  linked: { label: "Linked", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  notLinked: { label: "Not linked", tone: "neutral" },
});

/**
 * PROTOTYPE permission groups for the profile editor.
 * These keys are UI-only placeholders — they are NOT the backend Permission
 * keys and must be replaced by the real Permission list when the API exists.
 */
export const PROTOTYPE_PERMISSION_GROUPS = [
  {
    id: "agreements",
    label: "Agreements",
    permissions: [
      { key: "agreements.send", label: "Send agreements" },
      { key: "agreements.viewAll", label: "View all organization agreements" },
      { key: "agreements.void", label: "Void agreements" },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    permissions: [
      { key: "templates.use", label: "Use templates" },
      { key: "templates.edit", label: "Create and edit templates" },
      { key: "templates.publish", label: "Publish templates" },
    ],
  },
  {
    id: "users",
    label: "Users",
    permissions: [
      { key: "users.view", label: "View users" },
      { key: "users.manage", label: "Add, edit and deactivate users" },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    permissions: [
      { key: "admin.access", label: "Open the Admin workspace" },
      { key: "admin.profiles", label: "Manage permission profiles" },
      { key: "admin.rules", label: "Manage agreement rules" },
    ],
  },
  {
    id: "stamps",
    label: "Stamps",
    permissions: [
      { key: "stamps.use", label: "Use assigned stamps" },
      { key: "stamps.manage", label: "Create, assign and delete stamps" },
    ],
  },
  {
    id: "reporting",
    label: "Reporting",
    permissions: [
      { key: "reporting.view", label: "View LV Analytics" },
      { key: "reporting.export", label: "Export reports" },
    ],
  },
];

export const ALL_PROTOTYPE_PERMISSION_KEYS =
  PROTOTYPE_PERMISSION_GROUPS.flatMap((group) =>
    group.permissions.map((permission) => permission.key),
  );

/** Stamp availability, shown in the UI only (no backend behavior implied). */
export const STAMP_SCOPE = Object.freeze({
  company: "company",
  users: "users",
});

export const STAMP_IMAGE_TYPES = ["image/png", "image/jpeg"];
export const STAMP_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export const DEMO_NOTICE =
  "Demo data. Changes stay in this browser tab and are not saved to LV.SignFlow.";
