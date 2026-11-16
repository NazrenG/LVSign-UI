import { Navigate, Outlet } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useCurrentUser } from "./CurrentUserProvider";
import { SessionExpiryListener } from "./SessionExpiryListener";

export function ProtectedRoute() {
  const { accounts, instance } = useMsal();
  const { currentUser, loading, error } = useCurrentUser();

  const account = instance.getActiveAccount() ?? accounts[0] ?? null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Verifying your access...</p>
      </div>
    );
  }

  // Microsoft authentication has not been completed.
  if (!account) {
    return <Navigate to="/login" replace />;
  }

  // Microsoft login succeeded, but LV.SignFlow access is denied.
  if (error?.status === 403) {
    return <Navigate to="/access-denied" replace />;
  }
  if (error?.code === "SESSION_EXPIRED") {
    return <Navigate to="/session-expired" replace />;
  }

  // Other errors must not be treated as access denied.
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Unable to verify your access. Please try again.</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Unable to load your user profile.</p>
      </div>
    );
  }

  return (
    <>
      <SessionExpiryListener />
      <Outlet />
    </>
  );
}
