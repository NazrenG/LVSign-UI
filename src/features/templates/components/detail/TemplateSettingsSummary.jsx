import { Bell, Clock, Mail } from "lucide-react";
import { pluralize } from "@/utils/formatters";
import { countReminders } from "../../reminderSchedule";

function SettingTile({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-3 rounded-md border border-line bg-canvas-muted/60 p-4">
      <Icon
        className="mt-0.5 size-[18px] shrink-0 text-ink-muted"
        strokeWidth={1.5}
        aria-hidden
      />
      <div>
        <p className="text-[15px] font-medium text-ink">{title}</p>
        <p className="text-[13px] text-ink-muted">{description}</p>
      </div>
    </div>
  );
}

export function TemplateSettingsSummary({ template }) {
  const { expiry, copyRecipients } = template;

  const tiles = [
    {
      icon: Clock,
      title: `Expires after ${pluralize(expiry.expiresAfterDays, "day")}`,
      description:
        expiry.onExpire === "extend"
          ? "Sender can extend once by 7 days"
          : "Sender is notified on expiry",
    },
    {
      icon: Bell,
      title: expiry.remindersEnabled
        ? `Reminders every ${pluralize(expiry.repeatEveryDays, "day")}`
        : "No reminders",
      description: expiry.remindersEnabled
        ? `Up to ${countReminders(expiry)}, escalates on day ${expiry.escalateAfterDays}`
        : "Signers are not chased",
    },
    {
      icon: Mail,
      title: "Copy on completion",
      description: copyRecipients.length ? copyRecipients.join(", ") : "Nobody",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {tiles.map((tile) => (
        <SettingTile key={tile.title} {...tile} />
      ))}
    </div>
  );
}
