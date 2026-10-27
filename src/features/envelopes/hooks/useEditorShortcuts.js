import { useEffect, useRef } from "react";

const NUDGE = 0.002; // ≈ 1 pt on A4
const NUDGE_LARGE = 0.01;

const isTyping = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Editor keyboard shortcuts (ignored while typing in a form control):
 *   Delete / Backspace   remove selected field
 *   ⌘/Ctrl+D             duplicate selected field
 *   ⌘/Ctrl+Z, ⇧⌘Z, Ctrl+Y  undo / redo
 *   Arrow keys (+Shift)  nudge selected field
 *   Escape               clear selection
 */
export function useEditorShortcuts({
  isEnabled,
  selectedField,
  commands,
  actions,
}) {
  const latest = useRef(null);
  useEffect(() => {
    latest.current = { selectedField, commands, actions };
  });

  useEffect(() => {
    if (!isEnabled) return undefined;

    const onKeyDown = (event) => {
      if (
        isTyping(event.target) ||
        document.querySelector('[aria-modal="true"]')
      )
        return;
      const {
        selectedField: field,
        commands: cmd,
        actions: act,
      } = latest.current;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      // if (mod && key === "z") {
      //   event.preventDefault();
      //   if (event.shiftKey) hist.redo();
      //   else hist.undo();
      //   return;
      // }
      // if (mod && key === "y") {
      //   event.preventDefault();
      //   hist.redo();
      //   return;
      // }
      if (!field) return;

      if (key === "delete" || key === "backspace") {
        event.preventDefault();
        cmd.deleteSelectedField();
      } else if (mod && key === "d") {
        event.preventDefault();
        cmd.duplicateSelectedField();
      } else if (key === "escape") {
        cmd.clearSelection();
      } else if (key.startsWith("arrow")) {
        event.preventDefault();
        const step = event.shiftKey ? NUDGE_LARGE : NUDGE;
        const delta = {
          arrowleft: { x: field.x - step },
          arrowright: { x: field.x + step },
          arrowup: { y: field.y - step },
          arrowdown: { y: field.y + step },
        }[key];
        cmd.updateField(field.id, delta, { coalesceKey: `nudge:${field.id}` });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isEnabled]);
}
