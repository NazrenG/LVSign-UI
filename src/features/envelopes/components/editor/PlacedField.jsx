import { useCallback } from "react";
import { cn } from "@/utils/cn";
import { useFieldDrag } from "../../hooks/useFieldDrag";
import { FIELD_TYPES } from "../../models/fieldTypes";
import { UNASSIGNED_COLORS } from "../../utils/recipientColors";
import { recipientName } from "./RecipientDot";

const HANDLES = [
  { id: "nw", className: "-top-1 -left-1 cursor-nwse-resize" },
  { id: "ne", className: "-top-1 -right-1 cursor-nesw-resize" },
  { id: "sw", className: "-bottom-1 -left-1 cursor-nesw-resize" },
  { id: "se", className: "-bottom-1 -right-1 cursor-nwse-resize" },
];

const asPercent = (value) => `${value * 100}%`;

/**
 * A field drawn on a page. Position comes from normalized coordinates as
 * percentages, so it stays correct at any zoom or page size.
 */
export function PlacedField({
  field,
  recipient,
  colors,
  isSelected,
  getPageSize,
  onSelect,
  onCommitRect,
}) {
  const { previewRect, isDragging, startDrag } = useFieldDrag({
    rect: field,
    getPageSize,
    onCommit: useCallback(
      (rect) => onCommitRect(field.id, rect),
      [field.id, onCommitRect],
    ),
  });

  const rect = previewRect ?? field;
  const palette = recipient ? colors : UNASSIGNED_COLORS;
  const { icon: Icon, label: typeLabel } = FIELD_TYPES[field.type];
  const owner = recipient ? recipientName(recipient) : "No recipient";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${typeLabel} field for ${owner}`}
      title={`${typeLabel} · ${owner}`}
      onPointerDown={(event) => {
        onSelect(field.id);
        startDrag("move")(event);
      }}
      onKeyDown={(event) => event.key === "Enter" && onSelect(field.id)}
      className={cn(
        "absolute flex touch-none items-center gap-1 overflow-visible rounded-[2px] border-[1.5px] px-1 select-none",
        palette.border,
        recipient ? palette.soft : "border-dashed bg-danger-soft",
        isSelected
          ? "z-20 ring-2 ring-offset-1 " + palette.ring
          : "z-10 hover:z-20",
        isDragging ? "cursor-grabbing opacity-90 shadow-md" : "cursor-grab",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      )}
      style={{
        left: asPercent(rect.x),
        top: asPercent(rect.y),
        width: asPercent(rect.width),
        height: asPercent(rect.height),
      }}
    >
      <Icon
        className={cn("size-3.5 shrink-0", palette.text)}
        strokeWidth={1.75}
        aria-hidden
      />
      <span
        className={cn(
          "truncate text-[11px] leading-none font-medium",
          palette.text,
        )}
      >
        {field.label || typeLabel}
        {field.isRequired && <span aria-hidden> *</span>}
      </span>

      {isSelected &&
        HANDLES.map((handle) => (
          <span
            key={handle.id}
            aria-hidden
            onPointerDown={startDrag(handle.id)}
            className={cn(
              "absolute size-2.5 border bg-surface",
              palette.border,
              handle.className,
            )}
          />
        ))}
    </div>
  );
}
