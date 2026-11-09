import { Menu } from "lucide-react";
import { Logo } from "@/components/ui";
import { CURRENT_USER } from "@/data/people";
import { NotificationBell } from "@/features/notifications";

export function MobileHeader({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-canvas/95 px-4 backdrop-blur sm:px-6 lg:hidden">
      <Logo />

      <div className="flex items-center gap-1">
        <NotificationBell userId={CURRENT_USER.apiUserId} />

        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-ink hover:bg-canvas-muted"
          aria-label="Open menu"
        >
          <Menu className="size-6" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
