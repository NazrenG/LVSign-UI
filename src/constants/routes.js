export const ROUTES = {
  login: "/login",
  home: "/",
  agreements: "/agreements",
  templates: "/templates",
  insights: "/insights",
  admin: "/admin",
  editDocument: (id = ":documentId") => `/documents/${id}/edit`,
  signDocument: (id = ":documentId") => `/documents/${id}/sign`,
};
