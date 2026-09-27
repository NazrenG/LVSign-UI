import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui';
import { ROUTES } from '@/constants/routes';

export function SidebarUserCard({ user }) {
  return (
    <div className="flex items-center gap-3 border-t border-line pt-5">
      <Avatar name={user.name} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-ink">{user.name}</p>
        <p className="text-xs text-ink-muted">{user.department}</p>
      </div>
      <Link
        to={ROUTES.login}
        className="rounded-md p-2 text-ink-muted transition-colors hover:bg-canvas-muted hover:text-ink"
        aria-label="Sign out"
      >
        <LogOut className="size-[18px]" strokeWidth={1.5} />
      </Link>
    </div>
  );
}
