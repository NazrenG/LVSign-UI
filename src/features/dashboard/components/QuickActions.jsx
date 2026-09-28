import { LayoutTemplate, PenLine, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, IconTile } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { pluralize } from "@/utils/formatters";

function QuickActionCard({ icon, title, description, to }) {
  return (
    <Card
      as={Link}
      to={to}
      className="group block p-6 transition-colors hover:border-line-strong hover:shadow-sm"
    >
      <IconTile icon={icon} className="mb-5 group-hover:border-line-strong" />
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-[15px] text-ink-muted">{description}</p>
    </Card>
  );
}

export function QuickActions({ waitingCount, firstWaitingId }) {
  const actions = [
    {
      icon: Send,
      title: "Send a document",
      description: "Upload a file, add who signs and in what order.",
      to: ROUTES.editDocument("new"),
    },
    {
      icon: PenLine,
      title: "Sign",
      description: waitingCount
        ? `${pluralize(waitingCount, "document")} ${waitingCount === 1 ? "is" : "are"} waiting for your signature.`
        : "Nothing is waiting for your signature.",
      to: firstWaitingId
        ? ROUTES.signDocument(firstWaitingId)
        : ROUTES.agreements,
    },
    {
      icon: LayoutTemplate,
      title: "Use a template",
      description: "Leave requests, rotas, invoice approvals and more.",
      to: ROUTES.templates,
    },
  ];

  return (
    <section
      aria-label="Quick actions"
      className="grid gap-4 md:grid-cols-3 lg:gap-5"
    >
      {actions.map((action) => (
        <QuickActionCard key={action.title} {...action} />
      ))}
    </section>
  );
}
