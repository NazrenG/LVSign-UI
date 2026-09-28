import { TEMPLATES, createBlankTemplate } from "@/data/templates";

/**
 * Data access for templates. Today it is an in-memory store over mock data;
 * swapping these functions for fetch() calls to the .NET API is the only
 * change needed — pages and components depend on this module, not on data/.
 */
let templates = [...TEMPLATES];

const clone = (value) => structuredClone(value);

export const templatesService = {
  list: () => templates,

  get: (id) => templates.find((template) => template.id === id),

  /** A fresh, editable copy: blank, a duplicate, or an existing template. */
  createDraft({ id, duplicateOf } = {}) {
    if (duplicateOf) {
      const source = this.get(duplicateOf);
      if (source) {
        return {
          ...clone(source),
          id: "new",
          name: `Copy of ${source.name}`,
          version: 0,
        };
      }
    }
    const existing = id && id !== "new" ? this.get(id) : null;
    return existing ? clone(existing) : createBlankTemplate();
  },

  /** Publishes a draft as a new version and returns the saved template. */
  publish(draft, userId) {
    const isNew = draft.id === "new";
    const saved = {
      ...clone(draft),
      id: isNew ? slugify(draft.name) : draft.id,
      version: draft.version + 1,
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: userId,
    };
    templates = isNew
      ? [saved, ...templates]
      : templates.map((template) =>
          template.id === saved.id ? saved : template,
        );
    return saved;
  },
};

function slugify(text) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "template"}-${Date.now().toString(36)}`;
}
