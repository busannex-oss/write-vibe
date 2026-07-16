import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { shouldLogError } from "@/lib/query-client";

/**
 * Global error logger hook.
 * Call once at the app root (Layout) to catch:
 *   - Unhandled JS errors
 *   - Unhandled promise rejections
 *   - Network 403 / 404 from fetch/axios
 *
 * Preventative: deduplicates errors by message+page within a 60s window so
 * repeating errors (failing queries, render loops) don't flood the dashboard.
 */
export function useErrorLogger(user) {
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    const logError = async (payload) => {
      const dedupeKey = `${payload.error_type}:${payload.message}:${window.location.pathname}`;
      if (!shouldLogError(dedupeKey)) return;
      try {
        await base44.entities.ErrorLog.create({
          ...payload,
          user_email: userRef.current?.email || "anonymous",
          page: window.location.pathname + window.location.search,
        });
      } catch (_) {}
    };

    // Unhandled JS errors
    const onError = (event) => {
      logError({
        error_type: "runtime",
        message: event.message || "Unknown error",
        stack: event.error?.stack || "",
        severity: "high",
        context: JSON.stringify({ filename: event.filename, lineno: event.lineno })
      });
    };

    // Unhandled promise rejections
    const onUnhandledRejection = (event) => {
      const err = event.reason;
      const message = err?.message || String(err) || "Unhandled rejection";
      const statusCode = err?.response?.status || err?.status;

      let error_type = "unknown";
      let severity = "high";

      if (statusCode === 403) { error_type = "auth_403"; severity = "critical"; }
      else if (statusCode === 404) { error_type = "not_found_404"; severity = "medium"; }
      else if (statusCode >= 400) { error_type = "network"; severity = "high"; }
      else if (message.includes("query") || message.includes("fetch")) { error_type = "query"; }

      logError({
        error_type,
        message,
        stack: err?.stack || "",
        status_code: statusCode,
        severity,
        context: JSON.stringify({ url: err?.config?.url || err?.url || "" })
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);
}