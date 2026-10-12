import { useCallback, useEffect, useRef, useState } from "react";
import { moveRect, resizeRect, toNormalizedDelta } from "../utils/coordinates";

/** Pointer travel (px) below which a press counts as a click, not a drag. */
const DRAG_THRESHOLD_PX = 3;

/**
 * Move / resize a field with the pointer (mouse, pen or touch).
 * While dragging, `previewRect` holds the live normalized rect; on release
 * `onCommit(rect)` is called once, so one drag = one undo step.
 *
 * getPageSize() returns the rendered page size in px at drag start.
 */
export function useFieldDrag({ rect, getPageSize, onCommit }) {
  const [previewRect, setPreviewRect] = useState(null);
  const dragRef = useRef(null);
  const latest = useRef({ rect, onCommit });
  useEffect(() => {
    latest.current = { rect, onCommit };
  });

  const handleMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dxPx = event.clientX - drag.startX;
    const dyPx = event.clientY - drag.startY;
    if (!drag.hasMoved && Math.hypot(dxPx, dyPx) < DRAG_THRESHOLD_PX) return;
    drag.hasMoved = true;

    const delta = toNormalizedDelta(dxPx, dyPx, drag.pageSize);
    drag.rect =
      drag.handle === "move"
        ? moveRect(drag.startRect, delta)
        : resizeRect(drag.startRect, drag.handle, delta);
    setPreviewRect(drag.rect);
  }, []);

  const handleUp = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerup", handleUp);
    window.removeEventListener("pointercancel", handleUp);
    setPreviewRect(null);
    if (drag?.hasMoved) latest.current.onCommit(drag.rect);
  }, [handleMove]);

  useEffect(() => () => handleUp(), [handleUp]);

  /** handle: "move" | "nw" | "ne" | "sw" | "se" */
  const startDrag = useCallback(
    (handle) => (event) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      const { x, y, width, height } = latest.current.rect;
      dragRef.current = {
        handle,
        startX: event.clientX,
        startY: event.clientY,
        startRect: { x, y, width, height },
        rect: { x, y, width, height },
        pageSize: getPageSize(),
        hasMoved: false,
      };
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
      window.addEventListener("pointercancel", handleUp);
    },
    [getPageSize, handleMove, handleUp],
  );

  return { previewRect, isDragging: previewRect !== null, startDrag };
}
