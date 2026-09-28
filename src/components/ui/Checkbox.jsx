import { cn } from "@/utils/cn";

/** Native checkbox tinted with the primary colour; label is optional. */
export function Checkbox({ label, className, ...props }) {
  const box = (
    <input
      type="checkbox"
      className="size-[18px] shrink-0 cursor-pointer accent-primary"
      {...props}
    />
  );

  if (!label) return box;

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-[15px] text-ink",
        className,
      )}
    >
      {box}
      {label}
    </label>
  );
}
