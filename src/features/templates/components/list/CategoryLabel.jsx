import { cn } from "@/utils/cn";
import { getCategory } from "../../templateConstants";

/** Small icon + category name: 👥 HR */
export function CategoryLabel({ category, className }) {
  const { icon: Icon, label } = getCategory(category);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted",
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={1.5} aria-hidden />
      {label}
    </span>
  );
}
