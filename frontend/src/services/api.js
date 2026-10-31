// Backend address, set with VITE_API_URL in frontend/.env (see .env.example).
// A trailing slash is stripped so paths like '/api/doctors' join cleanly.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

// Called with the rejected token when a signed-in request comes back 401
let unauthorizedHandler = null;

// Register the handler for expired or revoked sessions; returns a function that removes it
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
};

/**
 * Call the backend API.
 * Resolves to { ok, status, data } for every HTTP response, where data is the parsed
 * JSON body (an empty object if the body is missing or not JSON, e.g. a proxy error page).
 * Rejects only when the server cannot be reached, or when the request is aborted
 * through options.signal (check isAbortError in the catch to ignore that case).
 *
 * @param {string} path    API path starting with '/api', e.g. '/api/doctors?search=heart'
 * @param {object} options method, JSON body, the login token for protected routes,
 *                         and an AbortSignal to cancel a request that is no longer needed
 */
export const apiRequest = async (path, { method = 'GET', body, token, signal } = {}) => {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  let data = {};
  try {
    const parsed = await response.json();
    if (parsed && typeof parsed === 'object') data = parsed;
  } catch {
    // Empty or non-JSON body: callers fall back to their own message and the status code
  }

  // Only a 401 on a request that sent a token means the session is over
  // (a wrong password on /login is also a 401, but carries no token)
  if (response.status === 401 && token) {
    unauthorizedHandler?.(token);
  }

  return { ok: response.ok, status: response.status, data };
};

// True for the error thrown when a request is cancelled with an AbortController
export const isAbortError = (error) => error?.name === 'AbortError';
