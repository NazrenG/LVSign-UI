import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { AgreementsPage } from "@/pages/AgreementsPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  {
    // Pages with the sidebar
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.agreements, element: <AgreementsPage /> },
      {
        path: ROUTES.templates,
        element: <PlaceholderPage title="Templates" />,
      },
      { path: ROUTES.insights, element: <PlaceholderPage title="Insights" /> },
      { path: ROUTES.admin, element: <PlaceholderPage title="Admin" /> },
    ],
  },
  // Full-screen flows (own header, no sidebar) — next step
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
