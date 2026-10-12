import { useCallback, useEffect, useRef, useState } from "react";

/** CSS pixels per PDF point at 100 % zoom (96 dpi / 72 pt). */
export const PX_PER_POINT = 96 / 72;
const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const CANVAS_PADDING_PX = 48;
/** "Fit" never enlarges past 100 % — a full-width A4 page is hard to work on. */
const MAX_FIT_ZOOM = 1;

/**
 * Zoom + page tracking for the document canvas.
 * - zoom "fit" fits the widest page into the canvas width
 * - currentPage follows scrolling (the page closest to the top third)
 */
export function useCanvasViewport({ pages, documentId }) {
  const scrollRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomSetting, setZoomSetting] = useState("fit");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) =>
      setContainerWidth(entry.contentRect.width),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const widestPagePx = Math.max(
    ...pages.map((page) => page.width * PX_PER_POINT),
    1,
  );
  const fitZoom = containerWidth
    ? Math.min(
        (containerWidth - CANVAS_PADDING_PX) / widestPagePx,
        MAX_FIT_ZOOM,
      )
    : 1;
  const zoom = zoomSetting === "fit" ? fitZoom : zoomSetting;

  const zoomIn = () =>
    setZoomSetting(ZOOM_STEPS.find((step) => step > zoom + 0.01) ?? zoom);
  const zoomOut = () =>
    setZoomSetting(
      [...ZOOM_STEPS].reverse().find((step) => step < zoom - 0.01) ?? zoom,
    );
  const zoomToFit = () => setZoomSetting("fit");

  // Track the page in view.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;
    const onScroll = () => {
      const marker =
        container.getBoundingClientRect().top + container.clientHeight / 3;
      const elements = container.querySelectorAll("[data-page-number]");
      let visible = 1;
      elements.forEach((element) => {
        if (element.getBoundingClientRect().top <= marker)
          visible = Number(element.dataset.pageNumber);
      });
      setCurrentPage(visible);
    };
    onScroll();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [documentId, pages.length]);

  // New document → back to the top.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setCurrentPage(1);
  }, [documentId]);

  const scrollToPage = useCallback((pageNumber) => {
    const element = scrollRef.current?.querySelector(
      `[data-page-number="${pageNumber}"]`,
    );
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return {
    scrollRef,
    zoom,
    isFit: zoomSetting === "fit",
    canZoomIn: zoom < ZOOM_STEPS.at(-1) - 0.01,
    canZoomOut: zoom > ZOOM_STEPS[0] + 0.01,
    zoomIn,
    zoomOut,
    zoomToFit,
    currentPage,
    scrollToPage,
  };
}
