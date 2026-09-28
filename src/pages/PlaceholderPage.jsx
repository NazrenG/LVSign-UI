import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout";
import { Button, Card, IconTile } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

/**
 * Temporary page for sections that are not built yet.
 * `standalone` is for routes rendered outside <AppLayout /> (no sidebar).
 */
export function PlaceholderPage({ title, standalone = false }) {
  return (
    <div className={cn(standalone && "mx-auto max-w-5xl px-4 py-8 sm:px-6")}>
      {standalone && (
        <Button
          as={Link}
          to={ROUTES.home}
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          className="mb-6"
        >
          Back
        </Button>
      )}
      <PageHeader title={title} />
      <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <IconTile icon={Construction} />
        <p className="text-ink-muted">This section is coming soon.</p>
      </Card>
    </div>
  );
}
