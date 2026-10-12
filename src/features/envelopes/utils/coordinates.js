/**
 * Field geometry helpers. Persisted rectangles are ALWAYS normalized:
 *   { x, y, width, height } with every value in 0..1 of the page size,
 *   (x, y) = top-left corner.
 * Pixels only exist transiently while dragging; convert with toNormalizedDelta().
 */

/** Smallest field, as a fraction of the page (≈ 8 × 6 pt on A4). */
export const MIN_SIZE = { width: 0.015, height: 0.008 };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Keeps values to 4 decimals so stored numbers stay readable and stable. */
const round = (value) => Math.round(value * 10000) / 10000;

export const roundRect = ({ x, y, width, height }) => ({
  x: round(x),
  y: round(y),
  width: round(width),
  height: round(height),
});

/** Forces a rect fully inside the page and at least MIN_SIZE. */
export function clampRect(rect) {
  const width = clamp(rect.width, MIN_SIZE.width, 1);
  const height = clamp(rect.height, MIN_SIZE.height, 1);
  return roundRect({
    width,
    height,
    x: clamp(rect.x, 0, 1 - width),
    y: clamp(rect.y, 0, 1 - height),
  });
}

/** True when the rect lies completely on the page (used by send checks). */
export const isRectWithinPage = ({ x, y, width, height }) =>
  x >= 0 &&
  y >= 0 &&
  width > 0 &&
  height > 0 &&
  x + width <= 1.0001 &&
  y + height <= 1.0001;

/** Pixel delta on a rendered page → normalized delta. */
export const toNormalizedDelta = (dxPx, dyPx, pageSizePx) => ({
  dx: dxPx / pageSizePx.width,
  dy: dyPx / pageSizePx.height,
});

/** Pixel point inside a rendered page → normalized point. */
export const toNormalizedPoint = (xPx, yPx, pageSizePx) => ({
  x: clamp(xPx / pageSizePx.width, 0, 1),
  y: clamp(yPx / pageSizePx.height, 0, 1),
});

export const moveRect = (rect, { dx, dy }) =>
  clampRect({ ...rect, x: rect.x + dx, y: rect.y + dy });

/**
 * Resizes from one corner. `handle` is "nw" | "ne" | "sw" | "se".
 * The opposite corner stays fixed; the result never leaves the page.
 */
export function resizeRect(rect, handle, { dx, dy }) {
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  let { x, y } = rect;
  let width = rect.width;
  let height = rect.height;

  if (handle.includes("e"))
    width = clamp(rect.width + dx, MIN_SIZE.width, 1 - rect.x);
  if (handle.includes("s"))
    height = clamp(rect.height + dy, MIN_SIZE.height, 1 - rect.y);
  if (handle.includes("w")) {
    x = clamp(rect.x + dx, 0, right - MIN_SIZE.width);
    width = right - x;
  }
  if (handle.includes("n")) {
    y = clamp(rect.y + dy, 0, bottom - MIN_SIZE.height);
    height = bottom - y;
  }
  return roundRect({ x, y, width, height });
}

/** A rect of `size` centred on a normalized point, kept on the page. */
export const rectCenteredAt = (point, size) =>
  clampRect({
    x: point.x - size.width / 2,
    y: point.y - size.height / 2,
    ...size,
  });

/**
 * Converts a normalized size defined for A4 portrait to the same physical
 * size on another page shape, so a signature box is never squashed on a
 * landscape page.
 */
const A4_RATIO = 842 / 595; // height / width
export function sizeForPage(size, page) {
  const ratio = page.height / page.width;
  return { width: size.width, height: (size.height * A4_RATIO) / ratio };
}
