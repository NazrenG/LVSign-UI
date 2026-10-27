import { CheckCircle2, FileText } from "lucide-react";
import { PdfPage } from "@/components/shared";
import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/formatters";
import { getDocumentProgress } from "../utils/signingProgress";

const THUMB = 96;

/** Documents with their completion state; the one in view shows its pages. */
export function DocumentNavigator({
  session,
  myFields,
  values,
  visible,
  onSelectPage,
}) {
  return (
    <nav aria-label="Documents" className="space-y-5">
      <h2 className="text-[13px] font-medium tracking-wide text-ink-muted uppercase">
        {pluralize(session.documents.length, "document")}
      </h2>
      <ol className="space-y-4">
        {session.documents.map((document) => {
          const progress = getDocumentProgress(document, myFields, values);
          const isCurrent = document.id === visible?.documentId;
          return (
            <li key={document.id}>
              <button
                type="button"
                onClick={() => onSelectPage(document.id, 1)}
                aria-current={isCurrent ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                  isCurrent
                    ? "bg-surface shadow-xs ring-1 ring-line"
                    : "hover:bg-canvas-muted",
                )}
              >
                <FileText
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    isCurrent ? "text-primary" : "text-ink-muted",
                  )}
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-[13px] font-medium",
                      isCurrent ? "text-primary" : "text-ink",
                    )}
                  >
                    {document.fileName}
                  </span>
                  <span className="block text-[12px] text-ink-muted">
                    {pluralize(document.pages.length, "page")}
                  </span>
                  {progress.requiredCount > 0 ? (
                    <span
                      className={cn(
                        "mt-0.5 flex items-center gap-1 text-[12px]",
                        progress.isComplete ? "text-success" : "text-ink-muted",
                      )}
                    >
                      {progress.isComplete && (
                        <CheckCircle2 className="size-3.5" aria-hidden />
                      )}
                      {progress.completedCount} / {progress.requiredCount}{" "}
                      fields complete
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-[12px] text-ink-subtle">
                      Nothing to fill in
                    </span>
                  )}
                </span>
              </button>

              {isCurrent && (
                <ol className="mt-3 flex flex-col items-center gap-3">
                  {document.pages.map((page) => {
                    const isPage = page.pageNumber === visible.pageNumber;
                    const needsAction = progress.pendingPages.has(
                      page.pageNumber,
                    );
                    return (
                      <li key={page.pageNumber}>
                        <button
                          type="button"
                          onClick={() =>
                            onSelectPage(document.id, page.pageNumber)
                          }
                          className="group flex flex-col items-center gap-1.5"
                        >
                          <span
                            className={cn(
                              "relative block border-2 bg-surface transition-colors",
                              isPage
                                ? "border-primary"
                                : "border-line group-hover:border-line-strong",
                            )}
                            style={{
                              width: THUMB,
                              height: (THUMB * page.height) / page.width,
                            }}
                          >
                            <PdfPage
                              url={document.fileUrl}
                              pageNumber={page.pageNumber}
                              renderWidth={THUMB}
                            />
                            {needsAction && (
                              <span
                                className="absolute -top-1.5 -right-1.5 size-3 rounded-full border-2 border-surface bg-primary"
                                title="Fields to complete on this page"
                              />
                            )}
                          </span>
                          <span
                            className={cn(
                              "text-[12px]",
                              isPage
                                ? "font-medium text-primary"
                                : "text-ink-muted",
                            )}
                          >
                            Page {page.pageNumber}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
