import { cn } from "@/utils/cn";

/**
 * Row of big serif numbers with labels, separated by dividers.
 * 2 columns on mobile, 4 on tablet+.
 * stats: [{ label, value }]
 */
export function StatGroup({ stats, className }) {
  return (
    <section
      aria-label="Summary"
      className={cn("border-y border-line py-6", className)}
    >
      <dl className="grid grid-cols-2 gap-y-6 md:grid-cols-4">
        {stats.map(({ label, value }, index) => (
          <div
            key={label}
            className={cn(
              "flex flex-col-reverse justify-end",
              index % 2 === 1 && "border-l border-line pl-5",
              index > 0 && "md:border-l md:border-line md:pl-7",
            )}
          >
            <dt className="mt-2 text-[15px] text-ink-muted">{label}</dt>
            <dd className="font-serif text-4xl text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
