import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { AgreementsPage } from "@/pages/AgreementsPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { TemplateBuilderPage } from "@/pages/TemplateBuilderPage";
import { TemplateDetailPage } from "@/pages/TemplateDetailPage";
import { TemplatesPage } from "@/pages/TemplatesPage";

export const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  {
    // Pages with the sidebar
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.agreements, element: <AgreementsPage /> },
      { path: ROUTES.templates, element: <TemplatesPage /> },
      { path: ROUTES.templateDetail(), element: <TemplateDetailPage /> },
      { path: ROUTES.insights, element: <PlaceholderPage title="Insights" /> },
      { path: ROUTES.admin, element: <PlaceholderPage title="Admin" /> },
    ],
  },
  // Full-screen flows (own header, no sidebar)
  { path: ROUTES.templateBuilder(), element: <TemplateBuilderPage /> },
  {
    path: ROUTES.editDocument(),
    element: <PlaceholderPage title="Prepare document" standalone />,
  },
  {
    path: ROUTES.signDocument(),
    element: <PlaceholderPage title="Sign document" standalone />,
  },
  { path: "*", element: <NotFoundPage /> },
]);
