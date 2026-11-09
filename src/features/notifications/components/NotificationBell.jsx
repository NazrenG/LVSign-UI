import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Bell } from "lucide-react";
import { notificationRepository } from "../api/notificationRepository";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell({
  userId,
}) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [loading, setLoading] =
    useState(false);

  const loadUnreadCount =
    useCallback(async () => {
      if (!userId) {
        return;
      }

      try {
        const count =
          await notificationRepository.getUnreadCount(
            userId,
          );

        setUnreadCount(count);
      } catch (error) {
        console.error(
          "Unread count failed:",
          error,
        );
      }
    }, [userId]);

  useEffect(() => {
    loadUnreadCount();

    const interval =
      window.setInterval(
        loadUnreadCount,
        30000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, [loadUnreadCount]);

  const openNotifications =
    async () => {
      setIsOpen(true);
      setLoading(true);

      try {
        const data =
          await notificationRepository.getNotifications(
            userId,
          );

        setNotifications(data);
      } catch (error) {
        console.error(
          "Notification load failed:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

  const handleRead =
    async (notification) => {
      if (
        notification.isRead
      ) {
        return;
      }

      await notificationRepository.markAsRead(
        notification.id,
        userId,
      );

      setNotifications(
        (previous) =>
          previous.map((item) =>
            item.id ===
            notification.id
              ? {
                  ...item,
                  isRead: true,
                }
              : item,
          ),
      );

      setUnreadCount(
        (previous) =>
          Math.max(
            0,
            previous - 1,
          ),
      );
    };

  const handleMarkAllRead =
    async () => {
      await notificationRepository.markAllAsRead(
        userId,
      );

      setNotifications(
        (previous) =>
          previous.map(
            (item) => ({
              ...item,
              isRead: true,
            }),
          ),
      );

      setUnreadCount(0);
    };

  return (
    <>
      <button
        type="button"
        onClick={
          openNotifications
        }
        className="relative rounded-lg p-2 text-ink-muted transition-colors hover:bg-canvas-muted hover:text-ink"
        aria-label="Notifications"
      >
        <Bell
          className="size-5"
          strokeWidth={1.6}
        />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        isOpen={isOpen}
        onClose={() =>
          setIsOpen(false)
        }
        notifications={
          notifications
        }
        loading={loading}
        unreadCount={
          unreadCount
        }
        onRead={handleRead}
        onMarkAllRead={
          handleMarkAllRead
        }
      />
    </>
  );
}