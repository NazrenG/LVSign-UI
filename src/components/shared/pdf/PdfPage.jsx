import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { loadPdf } from "./pdfDocuments";

/**
 * Renders one PDF page into a canvas that fills its parent.
 * The parent decides the size (keep it at the page's aspect ratio);
 * `renderWidth` is the CSS width used to pick a sharp render resolution.
 */
export function PdfPage({ url, pageNumber, renderWidth, className }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!url || !renderWidth) return undefined;
    let renderTask;
    let isCancelled = false;

    (async () => {
      try {
        const pdf = await loadPdf(url);
        const page = await pdf.getPage(pageNumber);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const scale =
          (renderWidth * pixelRatio) / page.getViewport({ scale: 1 }).width;
        const viewport = page.getViewport({ scale });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        renderTask = page.render({ canvas, viewport });
        await renderTask.promise;
        if (!isCancelled) setStatus("ready");
      } catch (error) {
        if (!isCancelled && error?.name !== "RenderingCancelledException") {
          setStatus("error");
        }
      }
    })();

    return () => {
      isCancelled = true;
      renderTask?.cancel();
    };
  }, [url, pageNumber, renderWidth]);

  return (
    <div className={cn("relative size-full bg-surface", className)}>
      <canvas
        ref={canvasRef}
        className={cn("size-full", status !== "ready" && "invisible")}
        aria-hidden
      />
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-canvas-muted/60" />
      )}
      {status === "error" && (
        <p className="absolute inset-0 flex items-center justify-center p-2 text-center text-[13px] text-danger">
          Page could not be displayed
        </p>
      )}
    </div>
  );
}
