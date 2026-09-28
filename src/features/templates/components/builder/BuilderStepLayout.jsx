import { cn } from "@/utils/cn";

/**
 * Page body shared by the builder steps:
 * serif title + description (+ optional control on the right),
 * main column and an optional sticky aside.
 */
export function BuilderStepLayout({
  title,
  description,
  headerAction,
  aside,
  children,
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        className={cn(
          "grid gap-6",
          aside && "lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8",
        )}
      >
        <div className="min-w-0 space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl text-ink sm:text-[34px]">
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-[15px] text-ink-muted">{description}</p>
              )}
            </div>
            {headerAction}
          </header>
          {children}
        </div>

        {aside && (
          <aside className="space-y-4 lg:sticky lg:top-28 lg:mt-24 lg:self-start">
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}
