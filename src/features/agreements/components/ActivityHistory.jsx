import { formatFullDateTime } from '@/utils/formatters';

export function ActivityHistory({ events }) {
  return (
    <section>
      <h3 className="mb-3 text-base font-semibold text-ink">History</h3>
      <ol className="space-y-2 font-mono text-[13px]">
        {events.map((event) => (
          <li key={`${event.at}-${event.action}`} className="flex flex-wrap gap-x-4">
            <time dateTime={event.at} className="text-ink-muted">
              {formatFullDateTime(event.at)}
            </time>
            <span className="text-ink">{event.action}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
