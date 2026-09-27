import { useSyncExternalStore } from 'react';

/** Tailwind breakpoints, kept in one place for JS-side checks. */
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 };

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useIsAtLeast = (breakpoint) => useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
