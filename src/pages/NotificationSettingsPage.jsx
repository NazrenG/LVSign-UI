import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout";
import { CURRENT_USER } from "@/data/people";
import {
  NotificationSettings,
  notificationRepository,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/features/notifications";

export function NotificationSettingsPage() {
  const [
    preferences,
    setPreferences,
  ] = useState(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result =
          await notificationRepository.getPreferences(
            CURRENT_USER.apiUserId,
          );

        setPreferences(
          result,
        );
      } catch (error) {
        console.error(error);

        toast.error(
          "Notification settings could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleChange = (
    key,
    value,
  ) => {
    setPreferences(
      (previous) => ({
        ...previous,
        [key]: value,
      }),
    );
  };

  const handleSave =
    async () => {
      try {
        setSaving(true);

        const result =
          await notificationRepository.updatePreferences(
            CURRENT_USER.apiUserId,
            preferences,
          );

        setPreferences(
          result,
        );

        toast.success(
          "Notification settings saved.",
        );
      } catch (error) {
        console.error(error);

        toast.error(
          "Notification settings could not be saved.",
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <>
      <PageHeader
        title="Notification settings"
        subtitle="Manage how and when LV SignFlow sends you notifications."
      />

      {loading ? (
        <div className="py-12 text-center text-sm text-ink-muted">
          Loading settings...
        </div>
      ) : (
        <div className="max-w-3xl">
          <NotificationSettings
            preferences={
              preferences
            }
            saving={saving}
            onChange={
              handleChange
            }
            onSave={
              handleSave
            }
          />
        </div>
      )}
    </>
  );
}