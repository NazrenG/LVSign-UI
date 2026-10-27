import { cn } from "@/utils/cn";
import { getSignatureFont } from "../utils/signatureFonts";

/**
 * Typed-signature size that fits a box: limited by its height and by the
 * text's approximate width (handwriting faces average ~0.45 em per letter).
 */
export const fitSignatureFont = (
  text = "",
  boxWidthPx,
  boxHeightPx,
  heightRatio = 0.75,
) =>
  Math.max(
    11,
    Math.min(
      boxHeightPx * heightRatio,
      boxWidthPx / Math.max(4, text.length * 0.45),
    ),
  );

/**
 * Draws an applied mark (typed, drawn, saved or stamp) inside its box.
 * `fontPx` sizes typed text (see fitSignatureFont).
 */
export function SignatureMark({ mark, fontPx = 24, className }) {
  if (!mark) return null;

  if (mark.imageDataUrl) {
    return (
      <img
        src={mark.imageDataUrl}
        alt=""
        draggable={false}
        className={cn("size-full object-contain", className)}
      />
    );
  }

  return (
    <span
      className={cn("block truncate leading-none text-primary", className)}
      style={{
        fontFamily: getSignatureFont(mark.fontKey).family,
        fontSize: fontPx,
      }}
    >
      {mark.typedText}
    </span>
  );
}
