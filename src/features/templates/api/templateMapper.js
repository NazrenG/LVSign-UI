const TEMPLATE_STATUS = {
  1: "draft",
  2: "published",
  3: "archived",
};

const TEMPLATE_CATEGORY = {
  1: "HR",
  2: "Finance",
  3: "Operations",
  4: "IT & Admin",
  5: "Legal",
};

const TEMPLATE_CATEGORY_TO_API = {
  HR: 1,
  Finance: 2,
  Operations: 3,
  "IT & Admin": 4,
  Legal: 5,
};

const TEMPLATE_ACCESS_LEVEL = {
  1: "view",
  2: "use",
  3: "edit",
  4: "manage",
};

function enumValue(value, map, fallback = null) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "number") {
    return map[value] ?? fallback;
  }

  if (typeof value === "string") {
    return value.charAt(0).toLowerCase() + value.slice(1);
  }

  return fallback;
}

function categoryValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return TEMPLATE_CATEGORY[value] ?? null;
  }

  if (value === "Admin") {
    return "IT & Admin";
  }

  return value;
}

export function fromTemplateDetailsDto(dto) {
  return {
    id: dto.id,

    name: dto.name ?? "",

    description: dto.description ?? "",

    category: categoryValue(dto.category),

    status: enumValue(dto.status, TEMPLATE_STATUS, "draft"),

    ownerId: dto.ownerUserId ?? null,

    version: dto.latestVersionNumber ?? 0,

    latestVersionId: dto.latestVersionId ?? null,

    latestVersionNumber: dto.latestVersionNumber ?? 0,

    latestVersionIsPublished: dto.latestVersionIsPublished ?? false,

    hasDraftVersion: dto.hasDraftVersion ?? false,

    latestPublishedVersionNumber: dto.latestPublishedVersionNumber ?? null,

    isOwner: dto.isOwner ?? false,

    effectiveAccessLevel: enumValue(
      dto.effectiveAccessLevel,
      TEMPLATE_ACCESS_LEVEL,
      "view",
    ),

    createdAt: dto.createdAt ?? null,

    updatedAt: dto.updatedAt ?? null,

    expirationDays: dto.expirationDays ?? null,

    reminderIntervalDays: dto.reminderIntervalDays ?? null,
  };
}

export function toTemplateRequest(template) {
  return {
    name: template.name?.trim() || "Untitled template",

    description: template.description?.trim() || null,

    category: template.category
      ? (TEMPLATE_CATEGORY_TO_API[template.category] ?? null)
      : null,

    expirationDays: template.expirationDays || null,

    reminderIntervalDays: template.reminderIntervalDays || null,
  };
}

export function fromTemplateListItemDto(dto) {
  return {
    id: dto.id,

    name: dto.name ?? "",

    description: dto.description ?? "",

    category: categoryValue(dto.category),

    status: enumValue(dto.status, TEMPLATE_STATUS, "draft"),

    version: dto.latestVersionNumber ?? 0,

    latestVersionNumber: dto.latestVersionNumber ?? 0,

    latestVersionIsPublished: dto.latestVersionIsPublished ?? false,

    hasDraftVersion: dto.hasDraftVersion ?? false,

    isOwner: dto.isOwner ?? false,

    effectiveAccessLevel: enumValue(
      dto.effectiveAccessLevel,
      TEMPLATE_ACCESS_LEVEL,
      "view",
    ),

    createdAt: dto.createdAt ?? null,

    updatedAt: dto.updatedAt ?? null,
  };
}
const RECIPIENT_TYPE = {
  1: "signer",
  2: "approver",
  3: "viewer",
  4: "copy",
};

const FIELD_TYPE = {
  1: "signature",
  2: "dateSigned",
  3: "text",
  4: "initials",
  5: "fullName",
  6: "email",
  7: "number",
  8: "checkbox",
  9: "radio",
  10: "dropdown",
  11: "stamp",
  12: "text",
};

export function fromTemplateRecipientRoleDto(dto) {
  return {
    id: dto.id,

    templateVersionId: dto.templateVersionId,

    name: dto.name ?? "",

    recipientType:
      typeof dto.recipientType === "number"
        ? dto.recipientType
        : (RECIPIENT_TYPE_TO_NUMBER[dto.recipientType] ?? 1),

    routingOrder: dto.routingOrder ?? 1,

    isRequired: dto.isRequired ?? true,

    defaultUserId: dto.defaultUserId ?? null,

    allowSenderEditRecipient: dto.allowSenderEditRecipient ?? true,

    allowSenderDeleteRecipient: dto.allowSenderDeleteRecipient ?? true,

    allowSenderChangeRoutingOrder: dto.allowSenderChangeRoutingOrder ?? true,
  };
}

const RECIPIENT_TYPE_TO_NUMBER = {
  Signer: 1,
  Approver: 2,
  Viewer: 3,
  CopyRecipient: 4,

  signer: 1,
  approver: 2,
  viewer: 3,
  copyRecipient: 4,
};

const FIELD_OWNER_TYPE = {
  1: "recipient",
  2: "sender",
  3: "directory",
  4: "calculated",
};

function mapFieldOwnerType(value, recipientRoleId) {
  if (typeof value === "number") {
    return FIELD_OWNER_TYPE[value] ?? null;
  }

  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value);

    if (FIELD_OWNER_TYPE[numeric]) {
      return FIELD_OWNER_TYPE[numeric];
    }

    return value.trim().toLowerCase();
  }

  // Yalnız köhnə DTO-lar üçün müvəqqəti fallback.
  return recipientRoleId ? "recipient" : "sender";
}

export function fromTemplateFieldDto(dto) {
  const recipientRoleId = dto.recipientRoleId ?? null;

  return {
    id: dto.id,

    templateDocumentId: dto.templateDocumentId,

    recipientRoleId,

    ownerType: mapFieldOwnerType(dto.ownerType, recipientRoleId),

    type: enumValue(dto.fieldType, FIELD_TYPE, "text"),

    label: dto.label ?? "",

    options: Array.isArray(dto.options) ? [...dto.options] : null,

    pageNumber: dto.pageNumber ?? 1,

    x: Number(dto.x ?? 0),
    y: Number(dto.y ?? 0),
    width: Number(dto.width ?? 0),
    height: Number(dto.height ?? 0),

    required: dto.isRequired ?? true,
  };
}

export function fromTemplateDocumentDto(dto) {
  return {
    id: dto.id,

    templateVersionId: dto.templateVersionId,

    name: dto.originalFileName ?? "Untitled document",

    contentType: dto.contentType ?? "application/pdf",

    fileSize: dto.fileSize ?? 0,

    order: dto.order ?? 1,

    pageCount: dto.pageCount ?? null,

    fileUrl: null,

    pages: [],
  };
}

export function toBuilderTemplate({
  template,
  roles = [],
  fields = [],
  documents = [],
}) {
  const firstDocument = documents[0] ?? null;

  return {
    id: template.id,

    name: template.name ?? "Untitled template",

    description: template.description ?? "",

    category: template.category ?? "HR",

    version: template.latestVersionNumber ?? 1,

    latestVersionId: template.latestVersionId ?? null,

    latestVersionIsPublished: template.latestVersionIsPublished ?? false,

    hasDraftVersion: template.hasDraftVersion ?? false,

    ownerId: template.ownerId ?? null,

    status: template.status ?? "draft",

    updatedAt: template.updatedAt ?? null,
    expirationDays: template.expirationDays ?? null,

reminderIntervalDays: template.reminderIntervalDays ?? null,

    /*
     * Bunlar hələ mock UI component-lərin
     * crash etməməsi üçün saxlanılır.
     * Sonrakı E addımlarında real backend data ilə
     * tam uyğunlaşdıracağıq.
     */
    language: "English",

    docPrefix: "",

    sourceDocument: {
      id: firstDocument?.id ?? null,

      name: firstDocument?.name ?? "No document uploaded",

      pages: firstDocument?.pageCount ?? 0,
    },

    access: {
      staff: {
        use: true,
        edit: false,
      },

      hr: {
        use: true,
        edit: true,
      },

      finance: {
        use: true,
        edit: false,
      },

      operations: {
        use: true,
        edit: false,
      },

      admin: {
        use: true,
        edit: true,
      },
    },

    allowRouteChange: true,

    hidden: false,

    signingOrder: getSigningOrder(roles),

    copyRecipients: [],

    rules: {
      onDecline: "Stop the route and notify the sender",

      onComplete: "Archive only",

      skipSelfApproval: false,

      requireComment: false,
    },

    expiry: {
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

      channels: {
        email: true,
        inApp: true,
      },
    },

    roles: roles.map(mapBuilderRole),

    fields: fields.map(mapBuilderField),

    documents,
  };
}

function getSigningOrder(roles) {
  if (roles.length <= 1) {
    return "sequential";
  }

  const orders = roles.map((role) => role.routingOrder);

  return orders.every((order) => order === orders[0])
    ? "parallel"
    : "sequential";
}

function mapBuilderRole(role) {
  return {
    id: role.id,

    /*
     * Mövcud builder hələ roleId gözləyir.
     * Backend role artıq dynamic olduğu üçün
     * real GUID-dən istifadə edirik.
     */
    roleId: role.id,

    name: role.name,

    recipientType: role.recipientType,

    routingOrder: role.routingOrder,

    isRequired: role.isRequired,

    defaultUserId: role.defaultUserId,

    action: Number(role.recipientType) === 3 ? "review" : "approve",

    resolver: role.defaultUserId ? "Default user" : "Selected when sending",

    delegate: "No",

    timeToActDays: 3,

    allowSenderEditRecipient: role.allowSenderEditRecipient,

    allowSenderDeleteRecipient: role.allowSenderDeleteRecipient,

    allowSenderChangeRoutingOrder: role.allowSenderChangeRoutingOrder,
  };
}
function mapBuilderField(field) {
  const ownerType = field.ownerType;

  const recipientRoleId = field.recipientRoleId ?? null;

  return {
    id: field.id,

    templateDocumentId: field.templateDocumentId,

    recipientRoleId,

    ownerType,

    type: field.type,

    label: field.label || FIELD_LABELS[field.type] || field.type,

    options: Array.isArray(field.options) ? [...field.options] : null,

    pageNumber: field.pageNumber,

    x: field.x,
    y: field.y,
    width: field.width,
    height: field.height,

    required: field.required,

    filledBy:
      ownerType === "recipient"
        ? recipientRoleId
        : ownerType === "directory"
          ? "hrSystem"
          : ownerType === "calculated"
            ? "calculated"
            : "sender",
  };
}

const FIELD_LABELS = {
  signature: "Signature",
  dateSigned: "Date signed",
  text: "Text",
  initials: "Initials",
  fullName: "Full name",
  email: "Email",
  number: "Number",
  checkbox: "Checkbox",
  radio: "Radio",
  dropdown: "Dropdown",
  stamp: "Stamp",
};
