import {
  ChartNoAxesColumn,
  FileText,
  House,
  LayoutTemplate,
  Shield,
} from "lucide-react";
import { ROUTES } from "./routes";

export const MAIN_NAVIGATION = [
  { label: "Home", to: ROUTES.home, icon: House, end: true },
  { label: "Agreements", to: ROUTES.agreements, icon: FileText },
  { label: "Templates", to: ROUTES.templates, icon: LayoutTemplate },
  { label: "Insights", to: ROUTES.insights, icon: ChartNoAxesColumn },
  { label: "Admin", to: ROUTES.admin, icon: Shield },
];
