/**
 * Signer roles. Templates reference roles, never people —
 * the role is resolved to a person when a document is sent.
 */
export const SIGNER_ROLES = {
  dh: {
    id: "dh",
    shortName: "Dept head",
    code: "DH",
    name: "Department head",
    resolver: "Head of the employee’s department",
    source: "Resolved from department",
  },
  hr: {
    id: "hr",
    shortName: "HR",
    code: "HR",
    name: "HR manager",
    resolver: "Any member of group “HR managers” (3)",
    source: "HR managers group",
  },
  em: {
    id: "em",
    shortName: "Employee",
    code: "EM",
    name: "Employee",
    resolver: "The person named in “Employee name”",
    source: "Named in the form",
  },
  lm: {
    id: "lm",
    shortName: "Line mgr",
    code: "LM",
    name: "Line manager",
    resolver: "Line manager of the sender",
    source: "Resolved from HR system",
  },
  om: {
    id: "om",
    shortName: "Ops mgr",
    code: "OM",
    name: "Operations manager",
    resolver: "Operations manager of the depot",
    source: "Resolved from depot",
  },
  wl: {
    id: "wl",
    shortName: "Warehouse",
    code: "WL",
    name: "Warehouse lead",
    resolver: "Lead of the issuing warehouse",
    source: "Resolved from depot",
  },
  ss: {
    id: "ss",
    shortName: "Supervisor",
    code: "SS",
    name: "Shift supervisor",
    resolver: "Supervisor of the shift",
    source: "Resolved from rota",
  },
  fo: {
    id: "fo",
    shortName: "Finance",
    code: "FO",
    name: "Finance officer",
    resolver: "Any member of group “Finance officers” (4)",
    source: "Finance officers group",
  },
  fm: {
    id: "fm",
    shortName: "Fin. mgr",
    code: "FM",
    name: "Finance manager",
    resolver: "Head of Finance",
    source: "Resolved from directory",
  },
  lc: {
    id: "lc",
    shortName: "Legal",
    code: "LC",
    name: "Legal counsel",
    resolver: "Any member of group “Legal” (2)",
    source: "Legal group",
  },
  is: {
    id: "is",
    shortName: "IT security",
    code: "IS",
    name: "IT security",
    resolver: "Any member of group “IT security” (2)",
    source: "IT security group",
  },
};

/** Roles that can be granted access to a template (from LV Sign Admin). */
export const ACCESS_ROLES = [
  { id: "staff", name: "Staff", description: "All employees", people: 30 },
  { id: "hr", name: "HR", description: "HR officers and managers", people: 3 },
  { id: "finance", name: "Finance", description: "Finance team", people: 2 },
  {
    id: "operations",
    name: "Operations",
    description: "Depot and shift supervisors",
    people: 4,
  },
  {
    id: "admin",
    name: "Admin",
    description: "LV Sign administrators",
    people: 1,
  },
];
