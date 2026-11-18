import { useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/utils/cn";

export function Menu({ label = "More actions", items }) {
  const ref = useRef(null);
  const { isOpen, toggle, close } = useDisclosure();
  const [openUpward, setOpenUpward] = useState(false);

  const handleToggle = () => {
    if (!isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();

      const estimatedMenuHeight = items.length * 40 + 16;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setOpenUpward(
        spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow,
      );
    }

    toggle();
  };

  useClickOutside(ref, close, isOpen);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
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
          className={cn(
            "absolute right-0 z-30 min-w-44 rounded-md border border-line bg-surface py-1 shadow-lg",
            openUpward ? "bottom-full mb-1" : "top-full mt-1",
          )}
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
