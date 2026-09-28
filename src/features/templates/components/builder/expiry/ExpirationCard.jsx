import { Card, CardHeader, Input, RadioGroup, Select } from "@/components/ui";
import { EXPIRE_ACTIONS, VALID_FOR_OPTIONS } from "../../../templateConstants";

/** Positive whole number from an input, or the previous value if invalid. */
export const toDays = (event, fallback) => {
  const value = Number.parseInt(event.target.value, 10);
  return Number.isNaN(value) || value < 0 ? fallback : value;
};

export function ExpirationCard({ expiry, onChange }) {
  return (
    <Card className="p-5 sm:p-6">
      <CardHeader title="Expiration" />
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Document expires after"
          type="number"
          min={1}
          value={expiry.expiresAfterDays}
          suffix="days after sending"
          onChange={(event) =>
            onChange({
              expiresAfterDays: toDays(event, expiry.expiresAfterDays),
            })
          }
        />
        <Input
          label="Each signer has"
          type="number"
          min={1}
          value={expiry.signerDays}
          suffix="working days"
          onChange={(event) =>
            onChange({ signerDays: toDays(event, expiry.signerDays) })
          }
        />
        <Select
          label="Signed document valid for"
          options={VALID_FOR_OPTIONS}
          value={expiry.validFor}
          onChange={(event) => onChange({ validFor: event.target.value })}
        />
      </div>
      <div className="mt-5">
        <RadioGroup
          legend="When a document expires"
          options={EXPIRE_ACTIONS}
          value={expiry.onExpire}
          onChange={(onExpire) => onChange({ onExpire })}
        />
      </div>
    </Card>
  );
}
