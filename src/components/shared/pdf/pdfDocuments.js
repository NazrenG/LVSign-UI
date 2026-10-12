/**
 * Thin wrapper around pdf.js.
 * - pdf.js is imported lazily, so it is only downloaded on screens that render PDFs.
 * - Loaded documents are cached by source URL; every page/thumbnail shares one load.
 */
let pdfjsPromise;

function loadPdfjs() {
  pdfjsPromise ??= Promise.all([
    // "legacy" build: includes polyfills for very new JS APIs that the modern
    // build relies on (e.g. Map#getOrInsertComputed), so it runs in every
    // browser LV Sign supports, not only the latest Chrome.
    import("pdfjs-dist/legacy/build/pdf.min.mjs"),
    import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"),
  ]).then(([pdfjs, worker]) => {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  });
  return pdfjsPromise;
}

const cache = new Map();

/** Returns a cached PDFDocumentProxy for a URL (http(s) or blob:). */
export function loadPdf(url) {
  if (!cache.has(url)) {
    const promise = loadPdfjs()
      .then(
        (pdfjs) =>
          // isEvalSupported: never compile PDF-provided code (defence in depth).
          pdfjs.getDocument({ url, isEvalSupported: false }).promise,
      )
      .catch((error) => {
        cache.delete(url); // allow a retry
        throw error;
      });
    cache.set(url, promise);
  }
  return cache.get(url);
}

/** Page count and page sizes (PDF points) of a PDF, e.g. right after upload. */
export async function readPdfPages(url) {
  const pdf = await loadPdf(url);
  return Promise.all(
    Array.from({ length: pdf.numPages }, async (_, index) => {
      const page = await pdf.getPage(index + 1);
      const { width, height } = page.getViewport({ scale: 1 });
      return { pageNumber: index + 1, width, height };
    }),
  );
}

/** Frees a document, e.g. when an uploaded file is removed. */
export async function releasePdf(url) {
  const promise = cache.get(url);
  cache.delete(url);
  if (promise) (await promise.catch(() => null))?.destroy();
}
