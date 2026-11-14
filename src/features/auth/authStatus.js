/**
 * Proposed application-level authentication states (frontend UI only).
 * These are NOT a confirmed backend contract — the real values will come
 * from the MSAL integration and the backend's user-mapping response.
 */
export const AUTH_STATUS = Object.freeze({
  unauthenticated: "unauthenticated",
  authenticating: "authenticating",
  authenticated: "authenticated",
  /** Microsoft sign-in succeeded, but LV.SignFlow did not authorize the user. */
  accessDenied: "accessDenied",
  sessionExpired: "sessionExpired",
  /** Connectivity or unexpected authentication problem. */
  error: "error",
});
