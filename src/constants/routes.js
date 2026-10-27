export const ROUTES = {
  login: "/login",
  home: "/",
  agreements: "/agreements",
  templates: "/templates",
  templateDetail: (id = ":templateId") => `/templates/${id}`,
  /** Builder. Use id "new" for a blank template; add ?duplicate=<id> to copy one. */
  templateBuilder: (id = ":templateId") => `/templates/${id}/edit`,
  insights: "/insights",
  admin: "/admin",
  /**
   * Prepare Document editor for an envelope. Use "new" to start a draft;
   * add ?document=<documentId> to open a specific document.
   */
  prepareEnvelope: (envelopeId = ":envelopeId") =>
    `/envelopes/${envelopeId}/prepare`,
  /** Legacy link, redirects to prepareEnvelope. */
  editDocument: (id = ":documentId") => `/documents/${id}/edit`,
  /** Recipient signing flow for an envelope (full screen, no sidebar). */
  signEnvelope: (envelopeId = ":envelopeId") => `/envelopes/${envelopeId}/sign`,
  /** Legacy link, redirects to signEnvelope. */
  signDocument: (id = ":documentId") => `/documents/${id}/sign`,
};
