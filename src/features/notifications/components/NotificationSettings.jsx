import {
  Bell,
  CheckCircle2,
  Clock3,
  Mail,
  Send,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button, Card, SettingRow, Toggle } from "@/components/ui";

export function NotificationSettings({
  preferences,
  saving,
  onChange,
  onSave,
}) {
  return (
    <div className="space-y-6">
      <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold text-ink">Delivery channels</h2>

          <p className="mt-1 text-sm text-ink-muted">
            Choose how you receive LV SignFlow notifications.
          </p>
        </div>

        <SettingRow
          title="In-app notifications"
          description="Show notifications inside LV SignFlow."
          icon={Bell}
          control={
            <Toggle
              checked={preferences.inAppEnabled}
              onChange={(value) => onChange("inAppEnabled", value)}
              label="In-app notifications"
            />
          }
        />

        <SettingRow
          title="Email notifications"
          description="Receive notification emails."
          icon={Mail}
          control={
            <Toggle
              checked={preferences.emailEnabled}
              onChange={(value) => onChange("emailEnabled", value)}
              label="Email notifications"
            />
          }
        />
      </Card>

      <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold text-ink">Notification types</h2>

          <p className="mt-1 text-sm text-ink-muted">
            Choose which events you want to be notified about.
          </p>
        </div>

        <SettingRow
          title="Envelope sent"
          description="When an envelope is sent to you."
          icon={Send}
          control={
            <Toggle
              checked={preferences.envelopeSentEnabled}
              onChange={(value) => onChange("envelopeSentEnabled", value)}
              label="Envelope sent"
            />
          }
        />

        <SettingRow
          title="Signing reminders"
          description="Reminders for documents waiting for your action."
          icon={Clock3}
          control={
            <Toggle
              checked={preferences.signingReminderEnabled}
              onChange={(value) => onChange("signingReminderEnabled", value)}
              label="Signing reminders"
            />
          }
        />

        <SettingRow
          title="Envelope completed"
          description="When all required recipients complete the envelope."
          icon={CheckCircle2}
          control={
            <Toggle
              checked={preferences.envelopeCompletedEnabled}
              onChange={(value) => onChange("envelopeCompletedEnabled", value)}
              label="Envelope completed"
            />
          }
        />

        <SettingRow
          title="Envelope declined"
          description="When a recipient declines an envelope."
          icon={XCircle}
          control={
            <Toggle
              checked={preferences.envelopeDeclinedEnabled}
              onChange={(value) => onChange("envelopeDeclinedEnabled", value)}
              label="Envelope declined"
            />
          }
        />

        <SettingRow
          title="Envelope voided"
          description="When an envelope is voided by the sender."
          icon={XCircle}
          control={
            <Toggle
              checked={preferences.envelopeVoidedEnabled}
              onChange={(value) => onChange("envelopeVoidedEnabled", value)}
              label="Envelope voided"
            />
          }
        />

        <SettingRow
          title="Recipient signed"
          description="When a recipient completes their signing action."
          icon={UserCheck}
          control={
            <Toggle
              checked={preferences.recipientSignedEnabled}
              onChange={(value) => onChange("recipientSignedEnabled", value)}
              label="Recipient signed"
            />
          }
        />
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
