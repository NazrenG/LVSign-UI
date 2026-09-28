import { ArrowUp, Bell, Mail, Moon, Repeat } from "lucide-react";
import {
  Card,
  CardHeader,
  Checkbox,
  Input,
  Select,
  SettingRow,
  Toggle,
} from "@/components/ui";
import { cn } from "@/utils/cn";
import { toDays } from "./ExpirationCard";

const REPEAT_OPTIONS = [1, 2, 3, 5, 7].map((days) => ({
  value: days,
  label: `every ${days} day${days === 1 ? "" : "s"}`,
}));
const MAX_OPTIONS = [1, 2, 3, 4, 5].map((count) => ({
  value: count,
  label: `max ${count}`,
}));

export function RemindersCard({ expiry, onChange }) {
  const daysInput = (key, label) => (
    <Input
      aria-label={label}
      type="number"
      min={1}
      value={expiry[key]}
      suffix="days after"
      onChange={(event) => onChange({ [key]: toDays(event, expiry[key]) })}
      wrapperClassName="w-full sm:w-40"
    />
  );

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        title="Automatic reminders"
        className="mb-2 flex-row items-center justify-between"
        action={
          <Toggle
            label="Automatic reminders"
            checked={expiry.remindersEnabled}
            onChange={(remindersEnabled) => onChange({ remindersEnabled })}
          />
        }
      />

      <div
        className={cn(
          "divide-y divide-line",
          !expiry.remindersEnabled && "pointer-events-none opacity-50",
        )}
        aria-disabled={!expiry.remindersEnabled}
      >
        <SettingRow
          className="py-4"
          icon={Bell}
          title="First reminder"
          description="Sent to the current signer if they have not acted."
          control={daysInput("firstReminderDays", "First reminder, days after")}
        />
        <SettingRow
          className="py-4"
          icon={Repeat}
          title="Repeat"
          description="Keep reminding until they sign, decline or it expires."
          control={
            <>
              <Select
                aria-label="Repeat interval"
                options={REPEAT_OPTIONS}
                value={expiry.repeatEveryDays}
                onChange={(event) =>
                  onChange({ repeatEveryDays: Number(event.target.value) })
                }
                wrapperClassName="w-40"
              />
              <Select
                aria-label="Maximum reminders"
                options={MAX_OPTIONS}
                value={expiry.maxReminders}
                onChange={(event) =>
                  onChange({ maxReminders: Number(event.target.value) })
                }
                wrapperClassName="w-28"
              />
            </>
          }
        />
        <SettingRow
          className="py-4"
          icon={ArrowUp}
          title="Escalate"
          description="Tell the signer’s line manager and copy the sender."
          control={daysInput("escalateAfterDays", "Escalate, days after")}
        />
        <SettingRow
          className="py-4"
          icon={Moon}
          title="Quiet hours"
          description="No reminders at weekends or between 19:00 and 08:00 (Asia/Baku)."
          control={
            <Toggle
              label="Quiet hours"
              checked={expiry.quietHours}
              onChange={(quietHours) => onChange({ quietHours })}
            />
          }
        />
        <SettingRow
          className="pt-4"
          icon={Mail}
          title="Channels"
          description="Email is always sent. In-app notice appears on Home."
          control={
            <div className="flex gap-4">
              <Checkbox label="Email" checked disabled />
              <Checkbox
                label="In-app"
                checked={expiry.channels.inApp}
                onChange={(event) =>
                  onChange({
                    channels: {
                      ...expiry.channels,
                      inApp: event.target.checked,
                    },
                  })
                }
              />
            </div>
          }
        />
      </div>
    </Card>
  );
}
