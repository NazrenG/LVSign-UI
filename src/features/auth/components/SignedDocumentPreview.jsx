import { LogoMark } from '@/components/ui';

const PLACEHOLDER_LINE_WIDTHS = ['100%', '92%', '97%', '64%', '100%', '88%', '45%'];

/** Decorative sample of a signed document on the sign-in screen. */
export function SignedDocumentPreview() {
  return (
    <div className="aspect-[1/1.29] w-full max-w-md bg-surface p-12 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.2)]">
      <div className="flex h-full flex-col">
        <LogoMark className="h-5 w-6 text-[10px]" />
        <h2 className="mt-8 font-serif text-xl text-ink">Night Shift Rota — Koroglu Depot</h2>
        <div className="mt-5 space-y-3">
          {PLACEHOLDER_LINE_WIDTHS.map((width, index) => (
            <span key={index} className="block h-1.5 bg-canvas-muted" style={{ width }} />
          ))}
        </div>

        <div className="mt-auto">
          <p className="text-sm font-medium text-ink">Approved by</p>
          <svg viewBox="0 0 200 40" className="mt-3 h-10 w-48 text-primary" fill="none" aria-hidden>
            <path
              d="M4 34c4-20 12-30 18-8 3 10 8-14 14-6s6 12 12 2 10-10 14 0 8 4 14-4 10-2 14 4 12-4 28-8M10 38c40-4 90-6 150-10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="border-t border-line-strong pt-2 font-mono text-[11px] text-ink-muted">
            Farid Aliyev · 22 Sep 2026, 16:05 · LVS-2026-0919-A2D0
          </div>
        </div>
      </div>
    </div>
  );
}
