import { Logo } from "@/components/ui";
import { SignedDocumentPreview } from "./SignedDocumentPreview";

/**
 * Split-screen shell shared by the sign-in screen and the authentication
 * status pages (same layout the login page has always used).
 */
export function AuthLayout({ children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,44%)_1fr]">
      <main className="flex items-center px-4 py-12 sm:px-10 lg:px-16 xl:px-28">
        <div className="w-full max-w-lg">
          <Logo />
          <div className="mt-10">{children}</div>
          {footer && <p className="mt-10 text-sm text-ink-muted">{footer}</p>}
        </div>
      </main>

      <aside className="hidden items-center justify-center border-l border-line bg-canvas-muted p-12 lg:flex">
        <SignedDocumentPreview />
      </aside>
    </div>
  );
}
