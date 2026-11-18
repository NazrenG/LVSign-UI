
import { authenticatedFetch } from "@/features/auth/authenticatedFetch";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const headers = new Headers(options.headers);

  if (options.body != null && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/admin/users${path}`,
    {
      ...options,
      headers,
    },
  );

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;

    try {
      const error = await response.json();

      errorMessage =
        error.detail ||
        error.title ||
        error.message ||
        errorMessage;
    } catch {
      // Preserve fallback error message.
    }

    const exception = new Error(errorMessage);
    exception.status = response.status;

    throw exception;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const adminUsersApi = {
  // Users
  getUsers: () => request(""),

  getUser: (userId) =>
    request(`/${userId}`),

  createUser: (data) =>
    request("", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateUser: (userId, data) =>
    request(`/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateUserStatus: (userId, isActive) =>
    request(`/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),

  // Microsoft identity
  linkMicrosoftIdentity: (userId, tenantId, objectId) =>
    request(`/${userId}/identity-link`, {
      method: "POST",
      body: JSON.stringify({ tenantId, objectId }),
    }),

  // Roles
  getRoles: () =>
    request("/roles"),

  getUserRoles: (userId) =>
    request(`/${userId}/roles`),

  assignRole: (userId, roleId) =>
    request(`/${userId}/roles`, {
      method: "POST",
      body: JSON.stringify({ roleId }),
    }),

  removeRole: (userId, roleId) =>
    request(`/${userId}/roles/${roleId}`, {
      method: "DELETE",
    }),

  // Permission Profiles
  getPermissionProfiles: () =>
    request("/permission-profiles"),

  getUserPermissionProfiles: (userId) =>
    request(`/${userId}/permission-profiles`),

  assignPermissionProfile: (userId, permissionProfileId) =>
    request(`/${userId}/permission-profiles`, {
      method: "POST",
      body: JSON.stringify({ permissionProfileId }),
    }),

  removePermissionProfile: (userId, profileId) =>
    request(
      `/${userId}/permission-profiles/${profileId}`,
      { method: "DELETE" },
    ),
};
