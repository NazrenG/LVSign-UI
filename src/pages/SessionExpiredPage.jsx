import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { AUTH_STATUS } from "@/features/auth/authStatus";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthStatusView } from "@/features/auth/components/AuthStatusView";

/** Shown when the session ends; "Sign in again" returns to the sign-in screen. */
export function SessionExpiredPage() {
  const navigate = useNavigate();
  const handleSignInAgain = () => {
    navigate(ROUTES.login, { replace: true });
  };
  return (
    <AuthLayout footer="Need access? Contact your IT administrator.">
      <AuthStatusView
        status={AUTH_STATUS.sessionExpired}
        onSignIn={handleSignInAgain}
      />
    </AuthLayout>
  );
}
