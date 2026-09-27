import { StatusBadge } from '@/features/agreements';

/** Serif title + status badge + one-line meta. Shared by all dashboard cards. */
export function DocumentCardHeader({ agreement, meta }) {
  return (
    <div>
      <div className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:justify-between sm:gap-4">
        <h3 className="font-serif text-xl text-ink">{agreement.title}</h3>
        <StatusBadge agreement={agreement} />
      </div>
      <p className="mt-1.5 text-[15px] text-ink-muted">{meta}</p>
    </div>
  );
}
