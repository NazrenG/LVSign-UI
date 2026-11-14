import {
  fromTemplateDetailsDto,
  fromTemplateDocumentDto,
  fromTemplateFieldDto,
  fromTemplateListItemDto,
  fromTemplateRecipientRoleDto,
  toBuilderTemplate,
  toTemplateRequest,
} from "./templateMapper";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/* =========================================================
   ENUM → API MAPPINGS
   ========================================================= */

const FIELD_TYPE_TO_API = {
  signature: 1,
  dateSigned: 2,
  text: 3,
  initials: 4,
  fullName: 5,
  email: 6,
  number: 7,
  checkbox: 8,
  radio: 9,
  dropdown: 10,
  stamp: 11,
  note: 12,
};

const FIELD_OWNER_TO_API = {
  recipient: 1,
  sender: 2,
  directory: 3,
  calculated: 4,
};

/* =========================================================
   HELPERS
   ========================================================= */

async function readError(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    const json = JSON.parse(text);

    return json.message ?? json.title ?? text;
  } catch {
    return text;
  }
}

async function ensureSuccess(response, fallbackMessage) {
  if (response.ok) {
    return;
  }

  const message = await readError(response);

  throw new Error(message || fallbackMessage);
}

function toFieldRequest(field) {
  const ownerType = FIELD_OWNER_TO_API[field.ownerType];

  const fieldType = FIELD_TYPE_TO_API[field.type];

  if (!ownerType) {
    throw new Error(`Unsupported field owner type: ${field.ownerType}`);
  }

  if (!fieldType) {
    throw new Error(`Unsupported field type: ${field.type}`);
  }

  return {
    templateDocumentId: field.templateDocumentId,

    recipientRoleId:
      field.ownerType === "recipient" ? field.recipientRoleId : null,

    ownerType,

    fieldType,

    pageNumber: field.pageNumber,

    x: field.x,
    y: field.y,
    width: field.width,
    height: field.height,

    isRequired: field.required,

    label: field.label?.trim() || null,

    options: ["dropdown", "radio"].includes(field.type)
      ? (field.options ?? [])
      : null,
  };
}

/* =========================================================
   ADAPTER
   ========================================================= */

export const apiTemplateAdapter = {
  /* =======================
     TEMPLATE LIST
     ======================= */

  async listAll() {
    const response = await fetch(`${API_BASE_URL}/api/templates`);

    await ensureSuccess(response, "Templates could not be loaded.");

    const dtos = await response.json();

    return dtos.map(fromTemplateListItemDto);
  },

  async listMine() {
    const response = await fetch(`${API_BASE_URL}/api/templates/my`);

    await ensureSuccess(response, "Your templates could not be loaded.");

    const dtos = await response.json();

    return dtos.map(fromTemplateListItemDto);
  },

  async listSharedWithMe() {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/shared-with-me`,
    );

    await ensureSuccess(response, "Shared templates could not be loaded.");

    const dtos = await response.json();

    return dtos.map(fromTemplateListItemDto);
  },

  /* =======================
     TEMPLATE DETAIL
     ======================= */

  async getById(templateId) {
    const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`);

    if (response.status === 404) {
      return null;
    }

    await ensureSuccess(response, "Template could not be loaded.");

    return fromTemplateDetailsDto(await response.json());
  },

  /* =======================
     TEMPLATE CREATE / UPDATE
     ======================= */

  async create(template) {
    const response = await fetch(`${API_BASE_URL}/api/templates`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(toTemplateRequest(template)),
    });

    await ensureSuccess(response, "Template could not be created.");

    const result = await response.json();

    const templateId = typeof result === "string" ? result : result.id;

    if (!templateId) {
      throw new Error("Template id was not returned by the server.");
    }

    return templateId;
  },

  async update(templateId, template) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(toTemplateRequest(template)),
      },
    );

    await ensureSuccess(response, "Template could not be updated.");

    return fromTemplateDetailsDto(await response.json());
  },

  async delete(templateId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}`,
      {
        method: "DELETE",
      },
    );

    await ensureSuccess(response, "Template could not be deleted.");
  },

  /* =======================
     PUBLISH / VERSION
     ======================= */

  async publish(templateId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/publish`,
      {
        method: "POST",
      },
    );

    await ensureSuccess(response, "Template could not be published.");

    return fromTemplateDetailsDto(await response.json());
  },

  async createNewVersion(templateId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/versions`,
      {
        method: "POST",
      },
    );

    await ensureSuccess(
      response,
      "A new template version could not be created.",
    );

    return fromTemplateDetailsDto(await response.json());
  },

  /* =======================
     RECIPIENT ROLES
     ======================= */

  async getRecipientRoles(templateId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/recipient-roles`,
    );

    await ensureSuccess(
      response,
      "Template recipient roles could not be loaded.",
    );

    const dtos = await response.json();

    return dtos
      .map(fromTemplateRecipientRoleDto)
      .sort((a, b) => a.routingOrder - b.routingOrder);
  },

  async createRecipientRole(templateId, role) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/recipient-roles`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: role.name,

          recipientType: Number(role.recipientType),

          routingOrder: role.routingOrder,

          isRequired: role.isRequired,

          defaultUserId: role.defaultUserId ?? null,

          allowSenderEditRecipient: role.allowSenderEditRecipient ?? true,

          allowSenderDeleteRecipient: role.allowSenderDeleteRecipient ?? true,

          allowSenderChangeRoutingOrder:
            role.allowSenderChangeRoutingOrder ?? true,
        }),
      },
    );

    await ensureSuccess(response, "Recipient role could not be created.");

    return fromTemplateRecipientRoleDto(await response.json());
  },

  async updateRecipientRole(templateId, roleId, role) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/recipient-roles/${roleId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: role.name,

          recipientType: Number(role.recipientType),

          routingOrder: role.routingOrder,

          isRequired: role.isRequired,

          defaultUserId: role.defaultUserId ?? null,

          allowSenderEditRecipient: role.allowSenderEditRecipient ?? true,

          allowSenderDeleteRecipient: role.allowSenderDeleteRecipient ?? true,

          allowSenderChangeRoutingOrder:
            role.allowSenderChangeRoutingOrder ?? true,
        }),
      },
    );

    await ensureSuccess(response, "Recipient role could not be updated.");

    return fromTemplateRecipientRoleDto(await response.json());
  },

  async deleteRecipientRole(templateId, roleId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/recipient-roles/${roleId}`,
      {
        method: "DELETE",
      },
    );

    await ensureSuccess(response, "Recipient role could not be removed.");
  },

  async reorderRecipientRoles(templateId, roleIds) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/recipient-roles/order`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          roleIds,
        }),
      },
    );

    await ensureSuccess(response, "Recipient order could not be updated.");
  },

  /* =======================
     DOCUMENTS
     ======================= */

  async getDocuments(templateId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/documents`,
    );

    await ensureSuccess(response, "Template documents could not be loaded.");

    const dtos = await response.json();

    return dtos.map(fromTemplateDocumentDto).sort((a, b) => a.order - b.order);
  },

  async uploadDocument(templateId, file) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/documents`,
      {
        method: "POST",
        body: formData,
      },
    );

    await ensureSuccess(response, "Template document could not be uploaded.");

    return fromTemplateDocumentDto(await response.json());
  },

  async deleteDocument(templateId, documentId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/documents/${documentId}`,
      {
        method: "DELETE",
      },
    );

    await ensureSuccess(response, "Template document could not be deleted.");
  },

  async getDocumentContent(templateId, documentId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/documents/${documentId}/content`,
    );

    await ensureSuccess(response, "Template document could not be loaded.");

    return response.blob();
  },

  /* =======================
     FIELDS
     ======================= */

  async getFields(templateId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/fields`,
    );

    await ensureSuccess(response, "Template fields could not be loaded.");

    const dtos = await response.json();

    return dtos.map(fromTemplateFieldDto);
  },

  async createField(templateId, field) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/fields`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(toFieldRequest(field)),
      },
    );

    await ensureSuccess(response, "Template field could not be created.");

    return fromTemplateFieldDto(await response.json());
  },

  async updateField(templateId, fieldId, field) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/fields/${fieldId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(toFieldRequest(field)),
      },
    );

    await ensureSuccess(response, "Template field could not be updated.");

    return fromTemplateFieldDto(await response.json());
  },

  async deleteField(templateId, fieldId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/fields/${fieldId}`,
      {
        method: "DELETE",
      },
    );

    await ensureSuccess(response, "Template field could not be deleted.");
  },

  /* =======================
     COMPOSITE LOADERS
     ======================= */

  async getFullDetail(templateId) {
    const [template, roles, fields, documents] = await Promise.all([
      this.getById(templateId),

      this.getRecipientRoles(templateId),

      this.getFields(templateId),

      this.getDocuments(templateId),
    ]);

    if (!template) {
      return null;
    }

    return {
      ...template,
      roles,
      fields,
      documents,
    };
  },

  async getBuilderTemplate(templateId) {
    const [template, roles, fields, documents] = await Promise.all([
      this.getById(templateId),

      this.getRecipientRoles(templateId),

      this.getFields(templateId),

      this.getDocuments(templateId),
    ]);

    if (!template) {
      return null;
    }

    return toBuilderTemplate({
      template,
      roles,
      fields,
      documents,
    });
  },

  // ============================
  // TEMPLATE CONDITIONAL ROUTING
  // ============================

  async getRoutingRuleSets(templateId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets`,
    );

    await ensureSuccess(response, "Routing rule sets could not be loaded.");

    return response.json();
  },
  async createRoutingRuleSet(templateId, ruleSet) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: ruleSet.name.trim(),
          isActive: ruleSet.isActive ?? true,
        }),
      },
    );

    await ensureSuccess(response, "Routing rule set could not be created.");

    return response.json();
  },

  async getRoutingRules(templateId, ruleSetId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets/${ruleSetId}/rules`,
    );

    await ensureSuccess(response, "Routing rules could not be loaded.");

    return response.json();
  },

  async getRoutingConditions(templateId, ruleSetId, ruleId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets/${ruleSetId}/rules/${ruleId}/conditions`,
    );

    await ensureSuccess(response, "Routing conditions could not be loaded.");

    return response.json();
  },

  async createRoutingRule(templateId, ruleSetId, rule) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets/${ruleSetId}/rules`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetRecipientRoleId: rule.targetRecipientRoleId,
          name: rule.name?.trim() || null,
          matchType: rule.matchType ?? 1,
          priority: rule.priority,
          isActive: rule.isActive ?? true,
        }),
      },
    );

    await ensureSuccess(response, "Routing rule could not be created.");

    return response.json();
  },

  async createRoutingCondition(templateId, ruleSetId, ruleId, condition) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets/${ruleSetId}/rules/${ruleId}/conditions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceTemplateFieldId: condition.sourceTemplateFieldId,
          operator: condition.operator,
          comparisonValue: condition.comparisonValue ?? null,
        }),
      },
    );

    await ensureSuccess(response, "Routing condition could not be created.");

    return response.json();
  },

  async createRoutingAction(templateId, ruleSetId, ruleId, action) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets/${ruleSetId}/rules/${ruleId}/actions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientRoleId: action.recipientRoleId,
          actionType: action.actionType,
          order: action.order,
        }),
      },
    );

    await ensureSuccess(response, "Routing action could not be created.");

    return response.json();
  },

  async getRoutingActions(templateId, ruleSetId, ruleId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets/${ruleSetId}/rules/${ruleId}/actions`,
    );

    await ensureSuccess(response, "Routing actions could not be loaded.");

    return response.json();
  },

  async updateRoutingCondition(
    templateId,
    ruleSetId,
    ruleId,
    conditionId,
    condition,
  ) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets/${ruleSetId}/rules/${ruleId}/conditions/${conditionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceTemplateFieldId: condition.sourceTemplateFieldId,
          operator: condition.operator,
          comparisonValue: condition.comparisonValue ?? null,
        }),
      },
    );

    await ensureSuccess(response, "Routing condition could not be updated.");
    return response.json();
  },

  async updateRoutingAction(templateId, ruleSetId, ruleId, actionId, action) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets/${ruleSetId}/rules/${ruleId}/actions/${actionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientRoleId: action.recipientRoleId,
          actionType: action.actionType,
          order: action.order,
        }),
      },
    );

    await ensureSuccess(response, "Routing action could not be updated.");
    return response.json();
  },

  async deleteRoutingRuleSet(templateId, ruleSetId) {
    const response = await fetch(
      `${API_BASE_URL}/api/templates/${templateId}/routing-rule-sets/${ruleSetId}`,
      {
        method: "DELETE",
      },
    );

    await ensureSuccess(response, "Conditional routing could not be deleted.");
  },
};
