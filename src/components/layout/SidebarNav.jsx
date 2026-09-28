import { NavLink } from "react-router-dom";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import { cn } from "@/utils/cn";

export function SidebarNav({ onNavigate }) {
  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {MAIN_NAVIGATION.map(({ label, to, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3.5 rounded-md border px-4 py-2.5 text-[15px] font-medium transition-colors",
                  isActive
                    ? "border-line bg-surface text-primary shadow-xs"
                    : "border-transparent text-ink hover:bg-canvas-muted",
                )
              }
            >
              <Icon className="size-[18px]" strokeWidth={1.5} aria-hidden />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
