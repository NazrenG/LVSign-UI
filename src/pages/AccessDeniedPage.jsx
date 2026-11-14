import { AUTH_STATUS } from "@/features/auth/authStatus";
import { authIntegration } from "@/features/auth/authIntegration";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthStatusView } from "@/features/auth/components/AuthStatusView";

/**
 * Shown when Microsoft sign-in succeeded but LV.SignFlow did not authorize
 * the employee. Not linked from anywhere yet — the future auth integration
 * redirects here. `supportHref` is left out until IT confirms a channel.
 */
export function AccessDeniedPage() {
  return (
    <AuthLayout>
      <AuthStatusView
        status={AUTH_STATUS.accessDenied}
        onSignOut={authIntegration.signOut}
      />
    </AuthLayout>
  );
}
