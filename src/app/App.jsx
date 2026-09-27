import { RouterProvider } from 'react-router-dom';
import { router } from './router';

/**
 * Root component. Global providers (auth, React Query, theme...)
 * will wrap <RouterProvider /> here as the app grows.
 */
export function App() {
  return <RouterProvider router={router} />;
}
