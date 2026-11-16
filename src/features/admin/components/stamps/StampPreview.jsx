import { cn } from "@/utils/cn";

/**
 * Shows a stamp image as uploaded: object-contain keeps the aspect ratio,
 * nothing is cropped or resized. The checkerboard makes PNG transparency
 * visible.
 */
export function StampPreview({ src, alt, className, onLoad }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-sm border border-line p-3",
        "bg-[length:16px_16px] bg-[position:0_0,8px_8px]",
        "bg-[image:linear-gradient(45deg,var(--color-canvas-muted)_25%,transparent_25%,transparent_75%,var(--color-canvas-muted)_75%),linear-gradient(45deg,var(--color-canvas-muted)_25%,transparent_25%,transparent_75%,var(--color-canvas-muted)_75%)]",
        "bg-surface",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        className="max-h-full max-w-full object-contain"
        draggable={false}
      />
    </div>
  );
}
