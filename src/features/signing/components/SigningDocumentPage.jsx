import { PdfPage } from "@/components/shared";
import { SigningField } from "./SigningField";

export const pageAnchorId = (documentId, pageNumber) =>
  `sign-page-${documentId}-${pageNumber}`;

/** One rendered PDF page with its fields on top. */
export function SigningDocumentPage({
  document,
  page,
  widthPx,
  fields,
  values,
  activeFieldId,
  handlers,
}) {
  const heightPx = (widthPx * page.height) / page.width;

  return (
    <figure
      id={pageAnchorId(document.id, page.pageNumber)}
      data-document-id={document.id}
      data-page-number={page.pageNumber}
      className="flex scroll-mt-6 flex-col items-center gap-2"
    >
      <div
        className="relative shrink-0 bg-surface shadow-[0_18px_40px_-26px_rgb(0_0_0/0.35)]"
        style={{ width: widthPx, height: heightPx }}
      >
        <div className="pointer-events-none absolute inset-0">
          <PdfPage
            url={document.fileUrl}
            pageNumber={page.pageNumber}
            renderWidth={widthPx}
          />
        </div>
        {fields.map((field) => (
          <SigningField
            key={field.id}
            field={field}
            value={values[field.id]}
            isActive={field.id === activeFieldId}
            pageWidthPx={widthPx}
            pageHeightPx={heightPx}
            onActivate={handlers.activate}
            onChange={(value) => handlers.change(field.id, value)}
            onOpenMark={handlers.openMark}
          />
        ))}
      </div>
      <figcaption className="font-mono text-[11px] text-ink-subtle">
        Page {page.pageNumber} of {document.pages.length}
      </figcaption>
    </figure>
  );
}
