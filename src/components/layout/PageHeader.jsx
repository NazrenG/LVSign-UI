import { cn } from '@/utils/cn';

/** Serif page title + optional subtitle and right-hand actions. */
export function PageHeader({ title, subtitle, actions, className }) {
  return (
    <header
      className={cn('mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between', className)}
    >
      <div className="min-w-0">
        <h1 className="font-serif text-3xl text-ink sm:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-2 text-[15px] text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
