import { forwardRef, useEffect, useState } from "react";
import { Files, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { useFitWidth } from "../hooks/useFitWidth";
import { SigningDocumentPage } from "./SigningDocumentPage";

const PX_PER_POINT = 96 / 72;
const MAX_FIT_WIDTH = 820; // a readable A4 at 100 %
const ZOOM_STEPS = [1, 1.25, 1.5, 2];

/**
 * All documents of the envelope stacked in one scroll, so "Next" can move
 * across documents without switching views. Reports the page in view.
 */
export const SigningDocumentViewer = forwardRef(function SigningDocumentViewer(
  {
    session,
    values,
    activeFieldId,
    handlers,
    onVisibleChange,
    onOpenDocuments,
    footer,
  },
  scrollRef,
) {
  const [measureRef, containerWidth] = useFitWidth();
  const [zoom, setZoom] = useState(1);
  const [visible, setVisible] = useState({
    documentId: session.documents[0]?.id,
    pageNumber: 1,
  });

  const fitWidth = Math.max(280, Math.min(containerWidth - 32, MAX_FIT_WIDTH));
  const pageWidth = (page) =>
    Math.round(
      fitWidth * zoom * Math.min(1, (page.width * PX_PER_POINT) / 794 || 1),
    );

  // Track the page nearest the top third of the viewport.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;
    const onScroll = () => {
      const marker =
        container.getBoundingClientRect().top + container.clientHeight / 3;
      let current = null;
      container.querySelectorAll("[data-page-number]").forEach((element) => {
        if (element.getBoundingClientRect().top <= marker || !current) {
          current = {
            documentId: element.dataset.documentId,
            pageNumber: Number(element.dataset.pageNumber),
          };
        }
      });
      if (current)
        setVisible((previous) =>
          previous.documentId === current.documentId &&
          previous.pageNumber === current.pageNumber
            ? previous
            : current,
        );
    };
    onScroll();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [scrollRef, containerWidth]);

  useEffect(() => onVisibleChange?.(visible), [visible, onVisibleChange]);

  const totalPages = session.documents.reduce(
    (sum, document) => sum + document.pages.length,
    0,
  );
  const pageIndex =
    session.documents
      .slice(
        0,
        session.documents.findIndex(
          (document) => document.id === visible.documentId,
        ),
      )
      .reduce((sum, document) => sum + document.pages.length, 0) +
    visible.pageNumber;

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-canvas px-3 py-1.5 sm:px-4">
        <Button
          variant="ghost"
          size="sm"
          icon={Files}
          onClick={onOpenDocuments}
          className="lg:invisible"
        >
          Documents
        </Button>
        <span
          className="font-mono text-[12px] text-ink-muted"
          aria-live="polite"
        >
          Page {Math.max(1, pageIndex)} of {totalPages}
        </span>
        <div className="flex items-center gap-1" aria-label="Zoom">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Zoom out"
            disabled={zoom <= ZOOM_STEPS[0]}
            onClick={() =>
              setZoom(ZOOM_STEPS[Math.max(0, ZOOM_STEPS.indexOf(zoom) - 1)])
            }
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-11 text-center font-mono text-[12px] text-ink-muted">
            {zoom === 1 ? "Fit" : `${zoom * 100}%`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Zoom in"
            disabled={zoom >= ZOOM_STEPS.at(-1)}
            onClick={() =>
              setZoom(
                ZOOM_STEPS[
                  Math.min(ZOOM_STEPS.length - 1, ZOOM_STEPS.indexOf(zoom) + 1)
                ],
              )
            }
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto bg-canvas">
        <div
          ref={measureRef}
          className="mx-auto flex w-max min-w-full flex-col items-center gap-8 px-4 pt-8 pb-36"
        >
          {session.documents.map((document, index) => (
            <section
              key={document.id}
              aria-label={document.fileName}
              className="flex flex-col items-center gap-6"
            >
              {session.documents.length > 1 && (
                <p className="text-[13px] text-ink-muted">
                  Document {index + 1} of {session.documents.length} ·{" "}
                  <span className="font-medium text-ink">
                    {document.fileName}
                  </span>
                </p>
              )}
              {document.pages.map((page) => (
                <SigningDocumentPage
                  key={page.pageNumber}
                  document={document}
                  page={page}
                  widthPx={pageWidth(page)}
                  fields={session.fields.filter(
                    (field) =>
                      field.documentId === document.id &&
                      field.pageNumber === page.pageNumber,
                  )}
                  values={values}
                  activeFieldId={activeFieldId}
                  handlers={handlers}
                />
              ))}
            </section>
          ))}
        </div>
      </div>
      {footer}
    </div>
  );
});
