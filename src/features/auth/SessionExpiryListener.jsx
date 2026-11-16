import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function SessionExpiryListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      navigate("/session-expired", { replace: true });
    };

    window.addEventListener("lvsign:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener(
        "lvsign:session-expired",
        handleSessionExpired,
      );
    };
  }, [navigate]);

  return null;
}
