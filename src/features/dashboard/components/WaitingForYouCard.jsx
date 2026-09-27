import { PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { SigningProgress, getPerson } from '@/features/agreements';
import { formatDueDate } from '@/utils/formatters';
import { DocumentCardHeader } from './DocumentCardHeader';

export function WaitingForYouCard({ agreement }) {
  const sender = getPerson(agreement.senderId);

  return (
    <Card className="p-5 sm:p-6">
      <DocumentCardHeader
        agreement={agreement}
        meta={`From ${sender.name} · Due ${formatDueDate(agreement.dueAt)}`}
      />
      <SigningProgress agreement={agreement} className="mt-6 border-b border-line pb-6" />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-sm text-ink-muted">{agreement.documentId}</span>
        <Button as={Link} to={ROUTES.signDocument(agreement.id)} icon={PenLine}>
          Sign document
        </Button>
      </div>
    </Card>
  );
}
