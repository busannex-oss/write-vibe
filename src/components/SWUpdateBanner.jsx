import React, { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";

/**
 * Shows a sticky banner when a new service worker version is available.
 * Listens for the 'swUpdateAvailable' event dispatched by main.jsx.
 */
export default function SWUpdateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener("swUpdateAvailable", handler);
    return () => window.removeEventListener("swUpdateAvailable", handler);
  }, []);

  if (!visible) return null;

  const handleRefresh = () => {
    // Tell the waiting SW to take control, then reload
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
    });
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500 text-white shadow-2xl shadow-amber-500/30 text-sm font-medium animate-in slide-in-from-bottom-4">
      <RefreshCw className="w-4 h-4 shrink-0" />
      <span>A new version of Write Vibe is ready.</span>
      <button
        onClick={handleRefresh}
        className="underline underline-offset-2 hover:no-underline font-semibold"
      >
        Refresh
      </button>
      <button
        onClick={() => setVisible(false)}
        className="ml-1 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}