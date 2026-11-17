import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface RouterContextType {
  currentPath: string;
  searchParams: URLSearchParams;
  navigate: (to: string, options?: { replace?: boolean; preserveHash?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const cleaned = pathname.replace(/\/+$/, '');
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window === 'undefined' ? '/' : normalizePath(window.location.pathname)
  );
  const [search, setSearch] = useState<string>(() =>
    typeof window === 'undefined' ? '' : window.location.search
  );

  useEffect(() => {
    const syncLocation = () => {
      setCurrentPath(normalizePath(window.location.pathname));
      setSearch(window.location.search);
    };
    window.addEventListener('popstate', syncLocation);
    return () => window.removeEventListener('popstate', syncLocation);
  }, []);

  const navigate = useCallback(
    (to: string, options?: { replace?: boolean; preserveHash?: boolean }) => {
      if (typeof window === 'undefined') return;
      const [rawPath, rawSearch] = to.split('?');
      const targetPath = normalizePath(rawPath);
      const targetSearch = rawSearch ? `?${rawSearch}` : '';
      const targetHash = options?.preserveHash ? window.location.hash : '';
      const nextUrl = `${targetPath}${targetSearch}${targetHash}`;

      if (
        normalizePath(window.location.pathname) !== targetPath ||
        window.location.search !== targetSearch ||
        (!options?.preserveHash && window.location.hash)
      ) {
        if (options?.replace) {
          window.history.replaceState({ qabsPath: targetPath }, '', nextUrl);
        } else {
          window.history.pushState({ qabsPath: targetPath }, '', nextUrl);
        }
      }

      setCurrentPath(targetPath);
      setSearch(targetSearch);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const searchParams = new URLSearchParams(search);

  return (
    <RouterContext.Provider value={{ currentPath, searchParams, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return ctx;
};

interface AppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}

export const AppLink: React.FC<AppLinkProps> = ({
  to,
  children,
  onClick,
  onNavigate,
  ...rest
}) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      rest.target === '_blank'
    ) {
      return;
    }
    e.preventDefault();
    navigate(to);
    if (onNavigate) onNavigate();
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};
