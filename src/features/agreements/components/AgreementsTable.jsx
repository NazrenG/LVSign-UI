import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/formatters';
import { getPerson } from '../agreementSelectors';
import { SignerChain } from './SignerChain';
import { StatusBadge } from './StatusBadge';

const COLUMNS = ['Document', 'Sender', 'Signing route', 'Status', 'Updated'];

function EmptyState() {
  return <p className="px-6 py-12 text-center text-ink-muted">No documents match this filter.</p>;
}

/** Desktop / tablet: a real <table>. */
function TableView({ agreements, selectedId, onSelect }) {
  return (
    <table className="w-full text-left">
      <thead className="border-b border-line text-sm text-ink-muted">
        <tr>
          {COLUMNS.map((column) => (
            <th key={column} scope="col" className="px-4 py-3 font-medium">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {agreements.map((agreement) => (
          <tr
            key={agreement.id}
            onClick={() => onSelect(agreement.id)}
            aria-selected={agreement.id === selectedId}
            className={cn(
              'cursor-pointer transition-colors',
              agreement.id === selectedId ? 'bg-primary-soft' : 'hover:bg-canvas',
            )}
          >
            <td className="min-w-52 px-4 py-4 font-medium text-ink">{agreement.title}</td>
            <td className="min-w-36 px-4 py-4 text-ink-muted">{getPerson(agreement.senderId).name}</td>
            <td className="px-4 py-4">
              <SignerChain agreement={agreement} />
            </td>
            <td className="px-4 py-4">
              <StatusBadge agreement={agreement} />
            </td>
            <td className="px-4 py-4 font-mono text-sm whitespace-nowrap text-ink-muted">
              {formatDateTime(agreement.updatedAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Mobile: stacked rows, same data. */
function ListView({ agreements, selectedId, onSelect }) {
  return (
    <ul className="divide-y divide-line">
      {agreements.map((agreement) => (
        <li key={agreement.id}>
          <button
            type="button"
            onClick={() => onSelect(agreement.id)}
            className={cn(
              'w-full space-y-3 px-4 py-4 text-left',
              agreement.id === selectedId && 'bg-primary-soft',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-ink">{agreement.title}</p>
              <StatusBadge agreement={agreement} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <SignerChain agreement={agreement} />
              <span className="font-mono text-xs text-ink-muted">{formatDateTime(agreement.updatedAt)}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function AgreementsTable(props) {
  if (props.agreements.length === 0) {
    return (
      <Card>
        <EmptyState />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="hidden overflow-x-auto md:block">
        <TableView {...props} />
      </div>
      <div className="md:hidden">
        <ListView {...props} />
      </div>
    </Card>
  );
}
