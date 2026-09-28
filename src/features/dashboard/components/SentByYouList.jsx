import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  AGREEMENT_STATUS,
  SigningProgress,
  getReminderLabel,
  getWaitingSummary,
} from "@/features/agreements";
import { formatDueDate } from "@/utils/formatters";
import { DocumentCardHeader } from "./DocumentCardHeader";

function getMeta(agreement) {
  if (agreement.status === AGREEMENT_STATUS.DRAFT)
    return `Draft · ${agreement.draftNote}`;
  return `${getWaitingSummary(agreement)} · Due ${formatDueDate(agreement.dueAt)}`;
}

function SentItemActions({ agreement }) {
  if (agreement.status === AGREEMENT_STATUS.DRAFT) {
    return (
      <Button
        as={Link}
        to={ROUTES.editDocument(agreement.id)}
        variant="secondary"
      >
        Continue preparing
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" icon={Bell}>
        {getReminderLabel(agreement)}
      </Button>
      <Button
        as={Link}
        to={`${ROUTES.agreements}?selected=${agreement.id}`}
        variant="secondary"
      >
        View details
      </Button>
    </>
  );
}

export function SentByYouList({ agreements }) {
  return (
    <Card as="ul" className="divide-y divide-line">
      {agreements.map((agreement) => (
        <li key={agreement.id} className="p-5 sm:p-6">
          <DocumentCardHeader agreement={agreement} meta={getMeta(agreement)} />
          <SigningProgress agreement={agreement} className="mt-6" />
          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            <SentItemActions agreement={agreement} />
          </div>
        </li>
      ))}
    </Card>
  );
}
