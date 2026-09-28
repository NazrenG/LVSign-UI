import { X } from "lucide-react";
import { Logo } from "@/components/ui";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/utils/cn";
import { SidebarNav } from "./SidebarNav";
import { SidebarUserCard } from "./SidebarUserCard";

/**
 * Desktop (lg+): fixed column on the left.
 * Mobile / tablet: off-canvas drawer toggled from <MobileHeader />.
 */
export function Sidebar({ user, isOpen, onClose }) {
  useLockBodyScroll(isOpen);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/30 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-canvas px-7 py-7",
          "transition-transform duration-200 lg:w-[284px] lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-muted hover:bg-canvas-muted lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav onNavigate={onClose} />
        </div>

        <SidebarUserCard user={user} />
      </aside>
    </>
  );
}
