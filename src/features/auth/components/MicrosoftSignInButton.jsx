import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { MicrosoftLogo } from "./MicrosoftLogo";

/**
 * "Continue with Microsoft". While `loading`, clicks are ignored and the
 * label switches to "Connecting to Microsoft..." without changing the size.
 */
export function MicrosoftSignInButton({
  onClick,
  loading = false,
  disabled = false,
  children = "Continue with Microsoft",
}) {
  const handleClick = (event) => {
    if (loading) return;
    onClick?.(event);
  };

  return (
    <Button
      size="lg"
      fullWidth
      onClick={handleClick}
      disabled={disabled && !loading}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      className={loading ? "cursor-progress" : undefined}
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" aria-hidden />
      ) : (
        <span className="inline-flex size-6 items-center justify-center rounded-[3px] bg-white">
          <MicrosoftLogo className="size-4" />
        </span>
      )}
      <span>{loading ? "Connecting to Microsoft..." : children}</span>
    </Button>
  );
}
