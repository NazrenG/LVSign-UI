import { LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { useCurrentUser } from "@/features/auth/CurrentUserProvider";
import { useMicrosoftLogout } from "@/features/auth/useMicrosoftLogout";

export function SidebarUserCard({ user }) {
  const signOut = useMicrosoftLogout();

  const { currentUser } = useCurrentUser();
  return (
    <div className="flex items-center gap-3 border-t border-line pt-5">
      <Avatar name={user.name} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-ink">{user.name}</p>
        <p className="text-xs text-ink-muted">{user.department}</p>
      </div>
      <div className="flex items-center">
        {currentUser?.userId && (
          <NotificationBell userId={currentUser.userId} />
        )}
        <Link
          to={ROUTES.notifications}
          className="rounded-md p-2 text-ink-muted transition-colors hover:bg-canvas-muted hover:text-ink"
          aria-label="Notification settings"
        >
          <Settings className="size-[18px]" strokeWidth={1.5} />
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="rounded-md p-2 text-ink-muted transition-colors hover:bg-canvas-muted hover:text-ink"
          aria-label="Sign out"
        >
          <LogOut className="size-[18px]" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
