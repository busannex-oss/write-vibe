import { QueryClient } from '@tanstack/react-query';

/**
 * Shared in-memory error dedupe store.
 * Prevents the same error (by message + page) from flooding the ErrorLog
 * dashboard within a short time window. This is the core preventative
 * measure against error cascades — e.g. a failing query that retries
 * repeatedly, or a render error in a loop.
 */
const recentErrors = new Map();
const DEDUPE_WINDOW_MS = 60000;

export function shouldLogError(key) {
  const now = Date.now();
  const last = recentErrors.get(key);
  if (last && now - last < DEDUPE_WINDOW_MS) return false;
  recentErrors.set(key, now);
  // Prune stale entries to avoid unbounded growth
  if (recentErrors.size > 200) {
    for (const [k, t] of recentErrors) {
      if (now - t > DEDUPE_WINDOW_MS) recentErrors.delete(k);
    }
  }
  return true;
}

/**
 * Preventative retry strategy:
 * - Never retry 404 (entity not found — permanent, retrying won't help)
 * - Never retry 401/403 (auth — retrying without re-auth won't help)
 * - Retry network errors and 5xx up to 2 times with exponential backoff
 */
const retryFn = (failureCount, error) => {
  const status = error?.response?.status || error?.status;
  if (status === 404 || status === 403 || status === 401) return false;
  if (failureCount >= 2) return false;
  return true;
};

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: retryFn,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 30000,
    },
    mutations: {
      retry: false,
    },
  },
});