import { authenticatedFetch } from "@/features/auth/authenticatedFetch";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin/departments`;

async function request(path = "", options = {}) {
  const headers = new Headers(options.headers);

  if (options.body != null) {
    headers.set("Content-Type", "application/json");
  }

  const response = await authenticatedFetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let body = null;

    try {
      body = await response.json();
    } catch {
      // Keep the fallback message.
    }

    const validationMessage = body?.errors
      ? Object.values(body.errors).flat().join(" ")
      : null;

    const error = new Error(
      validationMessage ||
        body?.detail ||
        body?.title ||
        `Department request failed (${response.status}).`,
    );

    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
}

export const adminDepartmentsApi = {
  getAll: () => request(),

  getById: (id) => request(`/${id}`),

  create: (values) =>
    request("", {
      method: "POST",
      body: JSON.stringify(values),
    }),

  update: (id, values) =>
    request(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    }),

  setActive: (id, isActive) =>
    request(`/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),

  remove: (id) =>
    request(`/${id}`, {
      method: "DELETE",
    }),
};
