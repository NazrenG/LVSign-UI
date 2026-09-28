import { EndMarker, StepMarker, VerticalSteps } from "@/components/shared";
import { Card, CardHeader } from "@/components/ui";
import { cn } from "@/utils/cn";
import { getReminderTimeline } from "../../../reminderSchedule";

const LABEL_TONE = {
  start: "text-ink",
  current: "text-primary",
  warning: "text-warning",
  danger: "text-danger",
};

/** Minimum distance (in % of the track) between two labels on the same row. */
const MIN_LABEL_GAP = 20;
const ROW_OFFSETS = ["mt-3", "mt-14", "mt-25"];
const ROW_HEIGHTS = ["h-20", "h-30", "h-40"];

/** Greedy layout: each label goes on the first row where it does not collide. */
function layoutLabels(events, total) {
  const lastLeftPerRow = [];
  return events.map((event) => {
    const left = (event.day / total) * 100;
    let row = lastLeftPerRow.findIndex((last) => left - last >= MIN_LABEL_GAP);
    if (row === -1)
      row = Math.min(lastLeftPerRow.length, ROW_OFFSETS.length - 1);
    lastLeftPerRow[row] = left;
    return { ...event, left, row };
  });
}

/** Horizontal track (sm+) — events placed proportionally to their day. */
function HorizontalTimeline({ events, total }) {
  const positioned = layoutLabels(events, total);
  const escalation = events.find((event) => event.tone === "warning");
  const darkUntil =
    ((escalation?.day ?? events.at(-2)?.day ?? 0) / total) * 100;
  const rowCount = Math.max(...positioned.map((event) => event.row)) + 1;

  return (
    <div className={cn("relative mx-2", ROW_HEIGHTS[rowCount - 1])}>
      <span
        className="absolute top-[7px] right-0 left-0 h-0.5 bg-line"
        aria-hidden
      />
      <span
        className="absolute top-[7px] left-0 h-0.5 bg-ink"
        style={{ width: `${darkUntil}%` }}
        aria-hidden
      />

      {positioned.map((event) => {
        const isLast = event.left === 100;
        return (
          <div
            key={`${event.day}-${event.label}`}
            className={cn(
              "absolute top-0 flex flex-col",
              isLast ? "items-end" : "items-start",
            )}
            style={
              isLast
                ? { right: 0 }
                : { left: `${event.left}%`, transform: "translateX(-8px)" }
            }
          >
            {event.tone === "danger" ? (
              <EndMarker tone="danger" className="mt-px" />
            ) : (
              <StepMarker state={event.tone} />
            )}
            <div
              className={cn(
                "text-[13px] whitespace-nowrap",
                ROW_OFFSETS[event.row],
                isLast && "text-right",
              )}
            >
              <p className="font-mono text-ink-muted">Day {event.day}</p>
              <p className={cn("font-medium", LABEL_TONE[event.tone])}>
                {event.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SignerTimelineCard({ expiry }) {
  const events = getReminderTimeline(expiry);

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        title="What one signer experiences"
        action={
          <span className="text-[13px] text-ink-muted">
            Timeline for a signer who never acts
          </span>
        }
      />

      <div className="hidden sm:block">
        <HorizontalTimeline events={events} total={expiry.expiresAfterDays} />
      </div>

      {/* Mobile: the same events as a vertical list */}
      <div className="sm:hidden">
        <VerticalSteps
          steps={events.slice(0, -1).map((event) => ({
            key: `${event.day}-${event.label}`,
            title: event.label,
            caption: `Day ${event.day}`,
            state: event.tone,
          }))}
          end={{
            label: `Day ${expiry.expiresAfterDays} · Expires`,
            tone: "danger",
          }}
        />
      </div>
    </Card>
  );
}
