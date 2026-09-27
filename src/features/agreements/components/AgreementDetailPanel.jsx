import { Bell, Download, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatDueDate } from '@/utils/formatters';
import { AGREEMENT_STATUS } from '../agreementStatus';
import { getPerson, getReminderLabel } from '../agreementSelectors';
import { ActivityHistory } from './ActivityHistory';
import { SigningTimeline } from './SigningTimeline';
import { StatusBadge } from './StatusBadge';

function DetailItem({ label, children, mono = false }) {
  return (
    <div>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className={mono ? 'mt-1 font-mono text-sm text-ink' : 'mt-1 text-ink'}>{children}</dd>
    </div>
  );
}

export function AgreementDetailPanel({ agreement, onClose }) {
  const reminderLabel = getReminderLabel(agreement);
  const canVoid = agreement.status === AGREEMENT_STATUS.AWAITING;

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl text-ink">{agreement.title}</h2>
          <StatusBadge agreement={agreement} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-ink-muted hover:bg-canvas"
          aria-label="Close details"
        >
          <X className="size-5" strokeWidth={1.5} />
        </button>
      </header>

      <dl className="grid grid-cols-2 gap-4 border-b border-line pb-6">
        <DetailItem label="Sent by">{getPerson(agreement.senderId).name}</DetailItem>
        <DetailItem label="Due">{agreement.dueAt ? formatDueDate(agreement.dueAt) : '—'}</DetailItem>
        <DetailItem label="Pages">{agreement.pages}</DetailItem>
        <DetailItem label="Document ID" mono>
          {agreement.documentId}
        </DetailItem>
      </dl>

      <section>
        <h3 className="mb-4 text-base font-semibold text-ink">Signing route</h3>
        <SigningTimeline agreement={agreement} />
      </section>

      <div className="flex flex-wrap gap-3 border-b border-line pb-6">
        {reminderLabel && (
          <Button variant="secondary" icon={Bell}>
            {reminderLabel}
          </Button>
        )}
        <Button variant="secondary" icon={Download}>
          Download PDF
        </Button>
        {canVoid && <Button variant="danger">Void document</Button>}
      </div>

      <ActivityHistory events={agreement.history} />
    </div>
  );
}
