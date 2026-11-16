import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { AccessDeniedPage } from "@/pages/AccessDeniedPage";
import { AgreementsPage } from "@/pages/AgreementsPage";
import { HomePage } from "@/pages/HomePage";
import { LegacyDocumentEditRedirect } from "@/pages/LegacyDocumentEditRedirect";
import { LegacyDocumentSignRedirect } from "@/pages/LegacyDocumentSignRedirect";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { SessionExpiredPage } from "@/pages/SessionExpiredPage";
import { TemplateBuilderPage } from "@/pages/TemplateBuilderPage";
import { TemplateDetailPage } from "@/pages/TemplateDetailPage";
import { TemplatesPage } from "@/pages/TemplatesPage";
import { NotificationSettingsPage } from "@/pages/NotificationSettingsPage";

/** Lazy route loader for one export of the Admin pages module. */
const adminRoute = (name) => async () => ({
  Component: (await import("@/pages/AdminPages"))[name],
});

export const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.accessDenied, element: <AccessDeniedPage /> },
  { path: ROUTES.sessionExpired, element: <SessionExpiredPage /> },
  {
    // Pages with the sidebar
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.agreements, element: <AgreementsPage /> },
      { path: ROUTES.templates, element: <TemplatesPage /> },
      { path: ROUTES.templateDetail(), element: <TemplateDetailPage /> },
      { path: ROUTES.insights, element: <PlaceholderPage title="Insights" /> },
      {
        // Admin workspace (UI prototype with demo data, no backend calls).
        // Lazy so the admin screens load only when someone opens Admin.
        path: ROUTES.admin,
        lazy: adminRoute("AdminLayout"),
        children: [
          { index: true, lazy: adminRoute("AdminOverviewPage") },
          { path: ROUTES.adminUsers, lazy: adminRoute("AdminUsersPage") },
          {
            path: ROUTES.adminDepartments,
            lazy: adminRoute("AdminDepartmentsPage"),
          },
          {
            path: ROUTES.adminPermissionProfiles,
            lazy: adminRoute("AdminPermissionProfilesPage"),
          },
          { path: ROUTES.adminStamps, lazy: adminRoute("AdminStampsPage") },
          {
            path: ROUTES.adminAgreementRules,
            lazy: adminRoute("AdminAgreementRulesPage"),
          },
        ],
      },
    ],
  },
  // Full-screen flows (own header, no sidebar)
  { path: ROUTES.templateBuilder(), element: <TemplateBuilderPage /> },
  {
    // Lazy: the editor (and pdf.js) only load when someone prepares a document.
    path: ROUTES.prepareEnvelope(),
    lazy: async () => ({
      Component: (await import("@/pages/EnvelopeEditorPage"))
        .EnvelopeEditorPage,
    }),
  },
  { path: ROUTES.editDocument(), element: <LegacyDocumentEditRedirect /> },
  {
    // Lazy: the signing flow (and pdf.js) only load when a recipient signs.
    path: ROUTES.signEnvelope(),
    lazy: async () => ({
      Component: (await import("@/pages/SigningPage")).SigningPage,
    }),
  },
  { path: ROUTES.signDocument(), element: <LegacyDocumentSignRedirect /> },
  { path: "*", element: <NotFoundPage /> },
  {
    path: ROUTES.notifications,
    element: <NotificationSettingsPage />,
  },
]);
