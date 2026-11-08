/**
 * Handwriting faces for typed signatures. Loaded from Google Fonts only when
 * a signing screen opens, so the rest of the app pays nothing for them.
 */
export const SIGNATURE_FONTS = [
  {
    key: "great-vibes",
    label: "Flowing",
    family: '"LV Great Vibes", cursive',
  },
  {
    key: "mrs-saint-delafield",
    label: "Formal",
    family: '"LV Mrs Saint Delafield", cursive',
  },
  {
    key: "caveat",
    label: "Casual",
    family: '"LV Caveat", cursive',
  },
];

export const DEFAULT_SIGNATURE_FONT = "great-vibes";

export const getSignatureFont = (key) =>
  SIGNATURE_FONTS.find((font) => font.key === key) ?? SIGNATURE_FONTS[0];

const STYLESHEET_ID = "lv-signature-fonts";

export function loadSignatureFonts() {
  if (typeof document === "undefined" || document.getElementById(STYLESHEET_ID))
    return;
  const link = document.createElement("link");
  link.id = STYLESHEET_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Great+Vibes&family=Mrs+Saint+Delafield&display=swap";
  document.head.appendChild(link);
}
 
export const toInitials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join("")
    .slice(0, 3);
