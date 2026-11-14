import { useCallback } from "react";

import { cn } from "@/utils/cn";
import { useFieldDrag } from "@/hooks/useFieldDrag";
import { UNASSIGNED_COLORS } from "@/features/envelopes/utils/recipientColors";
import { FIELD_TYPES } from "../../../templateConstants";

const HANDLES = [
  {
    id: "nw",
    className: "-top-1 -left-1 cursor-nwse-resize",
  },
  {
    id: "ne",
    className: "-top-1 -right-1 cursor-nesw-resize",
  },
  {
    id: "sw",
    className: "-bottom-1 -left-1 cursor-nesw-resize",
  },
  {
    id: "se",
    className: "-bottom-1 -right-1 cursor-nwse-resize",
  },
];

const asPercent = (value) => `${value * 100}%`;

export function TemplatePlacedField({
  field,
  isSelected,
  getPageSize,
  onSelect,
  onCommitRect,
  colorsByRoleId,
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
  const colors = field.recipientRoleId
    ? (colorsByRoleId?.[field.recipientRoleId] ?? UNASSIGNED_COLORS)
    : UNASSIGNED_COLORS;

  const fieldType = FIELD_TYPES[field.type];

  const Icon = fieldType?.icon;

  const label = field.label || fieldType?.label || field.type;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onPointerDown={(event) => {
        onSelect(field.id);

        startDrag("move")(event);
      }}
      className={cn(
        "absolute flex touch-none items-center gap-1 overflow-visible rounded-[2px] border-[1.5px] px-1 select-none",

        colors.border,
        colors.soft,
        colors.text,

        isSelected
          ? `z-20 ring-2 ring-offset-1 ${colors.ring}`
          : "z-10 hover:z-20",

        isDragging ? "cursor-grabbing opacity-90 shadow-md" : "cursor-grab",
      )}
      style={{
        left: asPercent(rect.x),

        top: asPercent(rect.y),

        width: asPercent(rect.width),

        height: asPercent(rect.height),
      }}
    >
      {Icon && <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />}

      <span className="truncate text-[11px] font-medium">
        {label}

        {field.required && <span> *</span>}
      </span>

      {isSelected &&
        HANDLES.map((handle) => (
          <span
            key={handle.id}
            onPointerDown={startDrag(handle.id)}
            className={cn(
              "absolute size-2.5 border bg-surface",
              colors.border,
              handle.className,
            )}
          />
        ))}
    </div>
  );
}
