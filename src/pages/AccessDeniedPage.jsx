import { AUTH_STATUS } from "@/features/auth/authStatus";
import { useMicrosoftLogout } from "@/features/auth/useMicrosoftLogout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthStatusView } from "@/features/auth/components/AuthStatusView";

export function AccessDeniedPage() {
  const signOut = useMicrosoftLogout();

  return (
    <AuthLayout>
      <AuthStatusView status={AUTH_STATUS.accessDenied} onSignOut={signOut} />
    </AuthLayout>
  );
}
