import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="text-ink-muted">The page you are looking for doesn’t exist.</p>
      <Button as={Link} to={ROUTES.home}>
        Back to home
      </Button>
    </main>
  );
}
