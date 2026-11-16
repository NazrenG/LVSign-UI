import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout";
import { useCurrentUser } from "@/features/auth/CurrentUserProvider";
import {
  NotificationSettings,
  notificationRepository,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/features/notifications";

export function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const { currentUser, loading: userLoading } = useCurrentUser();
  const userId = currentUser?.userId;

  useEffect(() => {
    if (userLoading || !userId) {
      if (!userLoading) setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);

      try {
        const result = await notificationRepository.getPreferences(userId);

        setPreferences(result);
      } catch (error) {
        console.error(error);
        toast.error("Notification settings could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, userLoading]);

  const handleChange = (key, value) => {
    setPreferences((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!userId) {
        toast.error("Please sign in to update notification settings.");
        return;
      }
      const result = await notificationRepository.updatePreferences(
        userId,
        preferences,
      );

      setPreferences(result);

      toast.success("Notification settings saved.");
    } catch (error) {
      console.error(error);

      toast.error("Notification settings could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-9 lg:py-9">
      <PageHeader
        title="Notification settings"
        subtitle="Manage how and when LV SignFlow sends you notifications."
      />

      {loading ? (
        <div
          role="status"
          className="rounded-md border border-line bg-surface px-6 py-16 text-center text-sm text-ink-muted"
        >
          Loading settings...
        </div>
      ) : (
        <div>
          <NotificationSettings
            preferences={preferences}
            saving={saving}
            onChange={handleChange}
            onSave={handleSave}
          />
        </div>
      )}
    </div>
  );
}
