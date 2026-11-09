const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function ensureSuccess(response, fallbackMessage) {
  if (response.ok) {
    return;
  }

  const message = await response.text();

  throw new Error(message || fallbackMessage);
}

export const apiNotificationAdapter = {
  async getNotifications(userId) {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user/${userId}`,
    );

    await ensureSuccess(response, "Notifications could not be loaded.");

    return response.json();
  },

  async getUnreadCount(userId) {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user/${userId}/unread-count`,
    );

    await ensureSuccess(
      response,
      "Unread notification count could not be loaded.",
    );

    return response.json();
  },

  async markAsRead(notificationId, userId) {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}/read?userId=${userId}`,
      {
        method: "PATCH",
      },
    );

    await ensureSuccess(response, "Notification could not be marked as read.");
  },

  async markAllAsRead(userId) {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user/${userId}/read-all`,
      {
        method: "PATCH",
      },
    );

    await ensureSuccess(response, "Notifications could not be marked as read.");
  },

  async getPreferences(userId) {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user/${userId}/preferences`,
    );

    await ensureSuccess(
      response,
      "Notification preferences could not be loaded.",
    );

    return response.json();
  },

  async updatePreferences(userId, preferences) {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/user/${userId}/preferences`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(preferences),
      },
    );

    await ensureSuccess(
      response,
      "Notification preferences could not be saved.",
    );

    return response.json();
  },
};
