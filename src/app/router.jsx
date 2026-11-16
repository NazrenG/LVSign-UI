import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ROUTES } from "@/constants/routes";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";

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

export const router = createBrowserRouter([
  // Public routes
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: ROUTES.accessDenied,
    element: <AccessDeniedPage />,
  },
  {
    path: ROUTES.sessionExpired,
    element: <SessionExpiredPage />,
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      // Pages with sidebar
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: ROUTES.agreements, element: <AgreementsPage /> },
          { path: ROUTES.templates, element: <TemplatesPage /> },
          {
            path: ROUTES.templateDetail(),
            element: <TemplateDetailPage />,
          },
          {
            path: ROUTES.insights,
            element: <PlaceholderPage title="Insights" />,
          },
          {
            path: ROUTES.admin,
            element: <PlaceholderPage title="Admin" />,
          },
          {
            path: ROUTES.notifications,
            element: <NotificationSettingsPage />,
          },
        ],
      },

      // Full-screen Template Builder
      {
        path: ROUTES.templateBuilder(),
        element: <TemplateBuilderPage />,
      },

      // Full-screen Envelope Editor
      {
        path: ROUTES.prepareEnvelope(),
        lazy: async () => ({
          Component: (await import("@/pages/EnvelopeEditorPage"))
            .EnvelopeEditorPage,
        }),
      },

      // Legacy Document Edit
      {
        path: ROUTES.editDocument(),
        element: <LegacyDocumentEditRedirect />,
      },

      // Full-screen Signing
      {
        path: ROUTES.signEnvelope(),
        lazy: async () => ({
          Component: (await import("@/pages/SigningPage")).SigningPage,
        }),
      },

      {
        path: ROUTES.signDocument(),
        element: <LegacyDocumentSignRedirect />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
