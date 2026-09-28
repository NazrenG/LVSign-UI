import { useEffect } from "react";

/** Prevents the page behind an open drawer from scrolling. */
export function useLockBodyScroll(isLocked) {
  useEffect(() => {
    if (!isLocked) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isLocked]);
}
