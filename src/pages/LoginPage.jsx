import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SignedDocumentPreview } from "@/features/auth/components/SignedDocumentPreview";

export function LoginPage() {
  const navigate = useNavigate();

  // TODO: call the auth API; for now any submit signs the user in.
  const handleSignIn = () => navigate(ROUTES.home);

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,44%)_1fr]">
      <main className="flex items-center px-4 py-12 sm:px-10 lg:px-16 xl:px-28">
        <div className="w-full max-w-lg">
          <Logo />
          <h1 className="mt-10 font-serif text-4xl text-ink">Sign in</h1>
          <p className="mt-3 mb-8 text-[15px] text-ink-muted">
            Internal approvals for LV Logistics colleagues.
          </p>
          <LoginForm onSubmit={handleSignIn} />
          <p className="mt-10 text-sm text-ink-muted">
            Forgot your password? Contact the IT service desk.
          </p>
        </div>
      </main>

      <aside className="hidden items-center justify-center border-l border-line bg-canvas-muted p-12 lg:flex">
        <SignedDocumentPreview />
      </aside>
    </div>
  );
}
