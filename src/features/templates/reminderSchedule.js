import { pluralize } from "@/utils/formatters";

const ORDINAL = ["1st", "2nd", "3rd", "4th", "5th"];

/**
 * Timeline for a signer who never acts, derived from expiry settings:
 * Day 0 reaches signer → reminders → escalation → expiry.
 */
export function getReminderTimeline(expiry) {
  const {
    expiresAfterDays,
    remindersEnabled,
    firstReminderDays,
    repeatEveryDays,
    maxReminders,
    escalateAfterDays,
  } = expiry;

  const events = [{ day: 0, label: "Reaches signer", tone: "start" }];

  if (remindersEnabled) {
    for (let index = 0; index < maxReminders; index += 1) {
      const day = firstReminderDays + index * repeatEveryDays;
      if (day >= expiresAfterDays) break;
      events.push({
        day,
        label: `${ORDINAL[index] ?? `${index + 1}th`} reminder`,
        tone: "current",
      });
    }
    if (escalateAfterDays > 0 && escalateAfterDays < expiresAfterDays) {
      events.push({
        day: escalateAfterDays,
        label: "Escalate to manager",
        tone: "warning",
      });
    }
  }

  events.sort((a, b) => a.day - b.day);
  events.push({ day: expiresAfterDays, label: "Expires", tone: "danger" });
  return events;
}

export function countReminders(expiry) {
  return getReminderTimeline(expiry).filter((event) =>
    event.label.endsWith("reminder"),
  ).length;
}

/** "Expires after 14 days, 3 reminders, escalation on day 5" */
export function describeExpiry(expiry) {
  const parts = [`Expires after ${pluralize(expiry.expiresAfterDays, "day")}`];
  if (expiry.remindersEnabled) {
    parts.push(pluralize(countReminders(expiry), "reminder"));
    parts.push(`escalation on day ${expiry.escalateAfterDays}`);
  } else {
    parts.push("no reminders");
  }
  return parts.join(", ");
}
