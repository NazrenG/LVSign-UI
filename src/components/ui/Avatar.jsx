import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/formatters";

const SIZES = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-10 text-sm",
};

const VARIANTS = {
  filled: "bg-ink text-white border-ink",
  outline: "bg-surface text-ink-muted border-line-strong",
  active: "bg-surface text-primary border-primary",
  danger: "bg-surface text-danger border-danger",
  soft: "bg-canvas-muted text-ink border-line",
};

/** Circle with initials. Pass `initials` to override the ones derived from `name` (e.g. role codes). */
export function Avatar({
  name,
  initials,
  size = "md",
  variant = "soft",
  className,
}) {
  return (
    <span
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] font-semibold",
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
    >
      {initials ?? getInitials(name)}
    </span>
  );
}
