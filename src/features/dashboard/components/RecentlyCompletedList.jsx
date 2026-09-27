import { Card } from '@/components/ui';
import { SignerChain, StatusBadge } from '@/features/agreements';
import { formatDateTime } from '@/utils/formatters';

export function RecentlyCompletedList({ agreements }) {
  return (
    <Card as="ul" className="divide-y divide-line">
      {agreements.map((agreement) => (
        <li
          key={agreement.id}
          className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <div className="min-w-0">
            <p className="font-medium text-ink">{agreement.title}</p>
            <p className="mt-0.5 font-mono text-[13px] text-ink-muted">
              Signed by {agreement.signers.length} of {agreement.signers.length} ·{' '}
              {formatDateTime(agreement.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SignerChain agreement={agreement} />
            <StatusBadge agreement={agreement} />
          </div>
        </li>
      ))}
    </Card>
  );
}
