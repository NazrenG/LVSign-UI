import { useEffect } from "react";

/** Calls `onOutside` on a click outside `ref` or on Escape, while `isActive`. */
export function useClickOutside(ref, onOutside, isActive = true) {
  useEffect(() => {
    if (!isActive) return undefined;

    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    const handleKey = (event) => {
      if (event.key === "Escape") onOutside();
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, onOutside, isActive]);
}
