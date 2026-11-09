import {
  Ban,
  Bell,
  CheckCircle2,
  Clock3,
  Mail,
  Send,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button, Card, CardHeader, IconTile, Toggle } from "@/components/ui";

/** Master channels — shown as two prominent tiles. */
const CHANNELS = [
  {
    key: "inAppEnabled",
    title: "In-app notifications",
    description: "Show notifications inside LV SignFlow.",
    icon: Bell,
  },
  {
    key: "emailEnabled",
    title: "Email notifications",
    description: "Receive notification emails.",
    icon: Mail,
  },
];

/** Event types — shown as one compact list. */
const EVENT_TYPES = [
  {
    key: "envelopeSentEnabled",
    title: "Envelope sent",
    description: "When an envelope is sent to you.",
    icon: Send,
  },
  {
    key: "signingReminderEnabled",
    title: "Signing reminders",
    description: "Reminders for documents waiting for your action.",
    icon: Clock3,
  },
  {
    key: "envelopeCompletedEnabled",
    title: "Envelope completed",
    description: "When all required recipients complete the envelope.",
    icon: CheckCircle2,
  },
  {
    key: "envelopeDeclinedEnabled",
    title: "Envelope declined",
    description: "When a recipient declines an envelope.",
    icon: XCircle,
  },
  {
    key: "envelopeVoidedEnabled",
    title: "Envelope voided",
    description: "When an envelope is voided by the sender.",
    icon: Ban,
  },
  {
    key: "recipientSignedEnabled",
    title: "Recipient signed",
    description: "When a recipient completes their signing action.",
    icon: UserCheck,
  },
];

function ChannelTile({ title, description, icon, checked, onToggle }) {
  return (
    <div className="flex items-start gap-4 rounded-md border border-line p-4">
      <IconTile icon={icon} className="shrink-0" />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[15px] font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>
      </div>
      <div className="shrink-0 pt-3">
        <Toggle checked={checked} onChange={onToggle} label={title} />
      </div>
    </div>
  );
}

function EventRow({ title, description, icon: Icon, checked, onToggle }) {
  return (
    <li className="flex min-h-[68px] items-center gap-3 px-4 py-3 sm:gap-4">
      <span className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-line bg-canvas min-[400px]:inline-flex">
        <Icon className="size-4 text-ink" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onToggle} label={title} />
    </li>
  );
}

export function NotificationSettings({
  preferences,
  saving,
  onChange,
  onSave,
}) {
  return (
    <Card className="overflow-hidden">
      <section className="p-5 sm:p-6" aria-labelledby="delivery-channels">
        <CardHeader
          title={<span id="delivery-channels">Delivery channels</span>}
          description="Choose how you receive LV SignFlow notifications."
          className="mb-4"
        />
        <div className="grid gap-3 md:grid-cols-2">
          {CHANNELS.map((channel) => (
            <ChannelTile
              key={channel.key}
              {...channel}
              checked={preferences[channel.key]}
              onToggle={(value) => onChange(channel.key, value)}
            />
          ))}
        </div>
      </section>

      <section
        className="border-t border-line p-5 sm:p-6"
        aria-labelledby="notification-types"
      >
        <CardHeader
          title={<span id="notification-types">Notification types</span>}
          description="Choose which events you want to be notified about."
          className="mb-4"
        />
        <ul className="divide-y divide-line rounded-md border border-line">
          {EVENT_TYPES.map((type) => (
            <EventRow
              key={type.key}
              {...type}
              checked={preferences[type.key]}
              onToggle={(value) => onChange(type.key, value)}
            />
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-3 border-t border-line bg-canvas px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[13px] text-ink-muted">
          Changes take effect after you save.
        </p>
        <Button
          onClick={onSave}
          disabled={saving}
          aria-busy={saving}
          className="w-full sm:w-auto"
        >
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </Card>
  );
}
