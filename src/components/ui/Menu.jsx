import { useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/utils/cn";

/**
 * "⋯" button with a small dropdown.
 * items: [{ label, onSelect, disabled?, tone?: "danger" }]
 */
export function Menu({ label = "More actions", items }) {
  const ref = useRef(null);
  const { isOpen, toggle, close } = useDisclosure();
  useClickOutside(ref, close, isOpen);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="rounded-md p-2 text-ink-muted hover:bg-canvas hover:text-ink"
      >
        <MoreHorizontal className="size-5" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <ul
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-44 rounded-md border border-line bg-surface py-1 shadow-lg"
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect();
                  close();
                }}
                className={cn(
                  "w-full px-3.5 py-2 text-left text-[15px] hover:bg-canvas disabled:pointer-events-none disabled:opacity-40",
                  item.tone === "danger" ? "text-danger" : "text-ink",
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
