import { useCallback, useRef, useState } from "react";
import { PdfPage } from "@/components/shared";

import { FIELD_DRAG_TYPE } from "@/components/shared/pdf/fieldDrag";
import { TemplatePlacedField } from "./TemplatePlacedField";
export function TemplateDocumentPage({
  document,
  page,
  widthPx,
  fields,
  selectedFieldId,
  onSelectField,
  onDropField,
  onCommitRect,
  colorsByRoleId
}) {
  const getPageSize = useCallback(() => {
    const box = pageRef.current.getBoundingClientRect();

    return {
      width: box.width,

      height: box.height,
    };
  }, []);
  const pageRef = useRef(null);

  const [isDropTarget, setIsDropTarget] = useState(false);

  const heightPx = (widthPx * page.height) / page.width;

  const acceptsDrop = (event) =>
    event.dataTransfer.types.includes(FIELD_DRAG_TYPE);

  const handleDrop = (event) => {
    if (!acceptsDrop(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setIsDropTarget(false);

    const raw = event.dataTransfer.getData(FIELD_DRAG_TYPE);

    if (!raw) {
      return;
    }

    let payload;

    try {
      payload = JSON.parse(raw);
    } catch {
      return;
    }

    const box = pageRef.current.getBoundingClientRect();

    const x = (event.clientX - box.left) / box.width;

    const y = (event.clientY - box.top) / box.height;

    onDropField({
      fieldType: payload.fieldType,

      filledBy: payload.filledBy,

      pageNumber: page.pageNumber,

      x,
      y,
    });
  };

  return (
    <figure className="flex flex-col items-center gap-2">
      <div
        ref={pageRef}
        className={`relative shrink-0 bg-surface shadow-[0_24px_48px_-28px_rgb(0_0_0/0.25)] transition-shadow ${
          isDropTarget ? "ring-2 ring-primary/40" : ""
        }`}
        style={{
          width: widthPx,
          height: heightPx,
        }}
        onDragEnter={(event) => {
          if (!acceptsDrop(event)) {
            return;
          }

          event.preventDefault();

          setIsDropTarget(true);
        }}
        onDragOver={(event) => {
          if (!acceptsDrop(event)) {
            return;
          }

          event.preventDefault();

          event.dataTransfer.dropEffect = "copy";

          setIsDropTarget(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget)) {
            return;
          }

          setIsDropTarget(false);
        }}
        onDrop={handleDrop}
      >
        {/* ÇOX VACİB:
            PDF canvas drag/drop event-lərini tutmasın */}
        <div className="pointer-events-none absolute inset-0">
          <PdfPage
            url={document.fileUrl}
            pageNumber={page.pageNumber}
            renderWidth={widthPx}
          />
        </div>

        {fields.map((field) => (
          <TemplatePlacedField
            key={field.id}
            field={field}
            isSelected={field.id === selectedFieldId}
            getPageSize={getPageSize}
            onSelect={onSelectField}
            onCommitRect={onCommitRect}
            colorsByRoleId={colorsByRoleId}
          />
        ))}
      </div>

      <figcaption className="font-mono text-[11px] text-ink-muted">
        Page {page.pageNumber} of {document.pages.length}
      </figcaption>
    </figure>
  );
}


