import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/formatters';
import { AGREEMENT_STATUS, SIGNER_STATE } from '../agreementStatus';
import { getPerson } from '../agreementSelectors';
import { CompletionMarker, SignerMarker } from './StepMarker';

function getTimelineCaption(signer) {
  switch (signer.state) {
    case SIGNER_STATE.SIGNED:
      return `Signed ${formatDateTime(signer.date)}`;
    case SIGNER_STATE.CURRENT:
      return `Waiting since ${formatDateTime(signer.date)}`;
    case SIGNER_STATE.DECLINED:
      return `Declined ${formatDateTime(signer.date)}`;
    case SIGNER_STATE.NOT_SENT:
      return 'Not sent';
    default:
      return 'Not yet';
  }
}

/** Vertical signing route used in the agreement detail panel. */
export function SigningTimeline({ agreement }) {
  const isComplete = agreement.status === AGREEMENT_STATUS.COMPLETED;

  return (
    <ol>
      {agreement.signers.map((signer) => {
        const person = getPerson(signer.personId);
        const isSigned = signer.state === SIGNER_STATE.SIGNED;
        return (
          <li key={signer.personId} className="relative flex gap-3 pb-5">
            <span
              aria-hidden
              className={cn('absolute top-4 bottom-0 left-[7px] w-0.5', isSigned ? 'bg-ink' : 'bg-line')}
            />
            <span className="pt-0.5">
              <SignerMarker state={signer.state} />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  'text-[15px] font-medium',
                  signer.state === SIGNER_STATE.CURRENT ? 'text-primary' : 'text-ink',
                )}
              >
                {person.name}
              </p>
              <p className="text-[13px] text-ink-muted">{person.title}</p>
              <p className="font-mono text-[13px] text-ink-muted">{getTimelineCaption(signer)}</p>
            </div>
          </li>
        );
      })}
      <li className="flex items-center gap-3">
        <span className="flex w-4 justify-center">
          <CompletionMarker isComplete={isComplete} />
        </span>
        <span className="text-sm text-ink">Completed</span>
      </li>
    </ol>
  );
}
