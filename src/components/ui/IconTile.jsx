import { cn } from '@/utils/cn';

/** Small square tile holding an icon (quick-action cards, empty states). */
export function IconTile({ icon: Icon, className }) {
  return (
    <span
      className={cn(
        'inline-flex size-12 items-center justify-center rounded-md border border-line bg-canvas',
        className,
      )}
    >
      <Icon className="size-5 text-ink" strokeWidth={1.5} aria-hidden />
    </span>
  );
}
