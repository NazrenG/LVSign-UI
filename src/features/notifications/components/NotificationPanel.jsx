import {
  CheckCheck,
  FileCheck2,
  FileSignature,
  Send,
  Timer,
  XCircle,
} from "lucide-react";
import { Sheet } from "@/components/ui";
import { cn } from "@/utils/cn";
import { NOTIFICATION_TYPES } from "../notificationTypes";

function getIcon(type) {
  switch (type) {
    case NOTIFICATION_TYPES.ENVELOPE_SENT:
      return Send;

    case NOTIFICATION_TYPES.SIGNING_REMINDER:
      return Timer;

    case NOTIFICATION_TYPES.ENVELOPE_COMPLETED:
      return FileCheck2;

    case NOTIFICATION_TYPES.ENVELOPE_DECLINED:
    case NOTIFICATION_TYPES.ENVELOPE_VOIDED:
      return XCircle;

    case NOTIFICATION_TYPES.RECIPIENT_SIGNED:
      return FileSignature;

    default:
      return FileSignature;
  }
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  loading,
  unreadCount,
  onRead,
  onMarkAllRead,
}) {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">
            {unreadCount} unread
          </p>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <CheckCheck className="size-4" />
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            Loading notifications...
          </p>
        ) : notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            No notifications yet.
          </p>
        ) : (
          <div className="space-y-2">
            {notifications.map(
              (notification) => {
                const Icon =
                  getIcon(
                    notification.type,
                  );

                return (
                  <button
                    type="button"
                    key={
                      notification.id
                    }
                    onClick={() =>
                      onRead(
                        notification,
                      )
                    }
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-colors",
                      notification.isRead
                        ? "border-line bg-surface hover:bg-canvas-muted"
                        : "border-primary/20 bg-primary/5 hover:bg-primary/10",
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas-muted text-primary">
                        <Icon
                          className="size-4"
                          strokeWidth={
                            1.7
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm text-ink",
                              !notification.isRead &&
                                "font-semibold",
                            )}
                          >
                            {
                              notification.title
                            }
                          </p>

                          {!notification.isRead && (
                            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>

                        <p className="mt-1 text-[13px] leading-5 text-ink-muted">
                          {
                            notification.message
                          }
                        </p>

                        <p className="mt-2 text-xs text-ink-subtle">
                          {new Date(
                            notification.createdAtUtc,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
}