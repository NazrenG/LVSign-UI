import { toast } from "sonner";

/**
 * Integration placeholder for Microsoft Entra ID (Phase 6.8).
 *
 * Nothing here signs anyone in or out: there is no MSAL, no token and no
 * navigation. Each action only tells the person that sign-in is not connected
 * yet. When MSAL is added, replace these three functions (e.g. loginRedirect /
 * logoutRedirect) — the UI components already call them through props.
 */
function notifyNotConnected() {
  toast.info("Microsoft sign-in isn't connected yet.", {
    description: "It will be available once Entra ID integration is complete.",
  });
}

export const authIntegration = {
  signInWithMicrosoft: notifyNotConnected,
  retrySignIn: notifyNotConnected,
  signOut: notifyNotConnected,
};
