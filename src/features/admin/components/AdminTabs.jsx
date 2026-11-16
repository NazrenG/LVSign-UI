import {
  BadgeCheck,
  Building2,
  LayoutDashboard,
  Scale,
  Stamp,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const ITEMS = [
  { label: "Overview", to: ROUTES.admin, icon: LayoutDashboard, end: true },
  { label: "Users", to: ROUTES.adminUsers, icon: Users },
  { label: "Departments", to: ROUTES.adminDepartments, icon: Building2 },
  {
    label: "Permission profiles",
    to: ROUTES.adminPermissionProfiles,
    icon: BadgeCheck,
  },
  { label: "Stamps", to: ROUTES.adminStamps, icon: Stamp },
  { label: "Agreement rules", to: ROUTES.adminAgreementRules, icon: Scale },
];

/** Section tabs; scroll horizontally on narrow screens. */
export function AdminTabs() {
  return (
    <nav
      aria-label="Admin sections"
      className="-mx-4 border-b border-line sm:mx-0"
    >
      <ul className="flex gap-1 overflow-x-auto px-4 sm:px-0">
        {ITEMS.map(({ label, to, icon: Icon, end }) => (
          <li key={to} className="shrink-0">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-[15px] whitespace-nowrap transition-colors",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                  isActive
                    ? "border-primary font-medium text-primary"
                    : "border-transparent text-ink-muted hover:text-ink",
                )
              }
            >
              <Icon className="size-4" strokeWidth={1.5} aria-hidden />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
