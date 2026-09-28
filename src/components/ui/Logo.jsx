import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export function LogoMark({ className }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-8 items-center justify-center rounded-[2px] bg-brand text-[13px] font-bold italic text-white",
        className,
      )}
      aria-hidden
    >
      LV
    </span>
  );
}

export function Logo({ className }) {
  return (
    <Link
      to={ROUTES.home}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="LV Sign home"
    >
      <LogoMark />
      <span className="font-serif text-2xl leading-none text-ink">Sign</span>
    </Link>
  );
}
