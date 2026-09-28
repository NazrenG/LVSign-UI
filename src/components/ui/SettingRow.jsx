import { cn } from "@/utils/cn";
import { IconTile } from "./IconTile";

/**
 * Title + description on the left, any control on the right.
 * Used for toggles, reminder rows and similar settings.
 */
export function SettingRow({ title, description, icon, control, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        {icon && <IconTile icon={icon} className="size-10" />}
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-ink">{title}</p>
          {description && (
            <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>
          )}
        </div>
      </div>
      {control && (
        <div className="flex shrink-0 items-center gap-2">{control}</div>
      )}
    </div>
  );
}
