import { useEffect, useState } from 'react';

// Minimal client-side routing: the app has two routes, / and /kit/:kitId

export function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);
  useEffect(() => {
    const onChange = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);
  return pathname;
}

export function matchKitId(pathname: string): string | null {
  const match = pathname.match(/^\/kit\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}
