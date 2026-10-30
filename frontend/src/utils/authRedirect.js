// Pages that must not be returned to after signing in
const AUTH_PAGES = ['/', '/login', '/signup'];

// Router state that remembers the current page, passed to links and redirects to /login
export const rememberPage = (location) => ({
  from: { pathname: location.pathname, search: location.search, hash: location.hash },
});

// Where to send the user after login or signup: the remembered page, or /home
export const getRedirectPath = (location) => {
  const from = location.state?.from;
  const pathname = from?.pathname;

  // Only same-site paths ("//host" would be read as another site)
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return '/home';
  }
  if (AUTH_PAGES.includes(pathname)) return '/home';

  return `${pathname}${from.search || ''}${from.hash || ''}`;
};
