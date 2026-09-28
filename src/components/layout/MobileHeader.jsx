import { Menu } from "lucide-react";
import { Logo } from "@/components/ui";

/** Top bar shown below the lg breakpoint, where the sidebar is hidden. */
export function MobileHeader({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-canvas/95 px-4 backdrop-blur sm:px-6 lg:hidden">
      <Logo />
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-ink hover:bg-canvas-muted"
        aria-label="Open menu"
      >
        <Menu className="size-6" strokeWidth={1.5} />
      </button>
    </header>
  );
}
