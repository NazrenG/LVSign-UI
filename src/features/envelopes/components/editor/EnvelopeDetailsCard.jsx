import { CalendarDays } from "lucide-react";
import { Card, CardHeader, Input, Select, Textarea } from "@/components/ui";

const REMINDER_OPTIONS = [
  { value: 0, label: "No reminders" },
  { value: 1, label: "Remind every day" },
  { value: 2, label: "Remind every 2 days" },
  { value: 3, label: "Remind every 3 days" },
  { value: 7, label: "Remind every week" },
];

/** Email subject/message, due date and reminders for the whole envelope. */
export function EnvelopeDetailsCard({ envelope, actions }) {
  return (
    <Card className="p-5">
      <CardHeader title="Message and deadline" className="mb-3" />
      <div className="space-y-4">
        <Input
          label="Email subject"
          value={envelope.emailSubject}
          onChange={(event) =>
            actions.updateDetails({ emailSubject: event.target.value })
          }
        />
        <Textarea
          label="Message to recipients"
          value={envelope.emailMessage}
          placeholder="Add a short note for the people signing"
          onChange={(event) =>
            actions.updateDetails({ emailMessage: event.target.value })
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due"
            type="date"
            icon={CalendarDays}
            value={envelope.dueDate ?? ""}
            onChange={(event) =>
              actions.updateDetails({ dueDate: event.target.value || null })
            }
          />
          <Select
            label="Reminders"
            options={REMINDER_OPTIONS}
            value={envelope.reminderEveryDays}
            onChange={(event) =>
              actions.updateDetails({
                reminderEveryDays: Number(event.target.value),
              })
            }
          />
        </div>
      </div>
    </Card>
  );
}
