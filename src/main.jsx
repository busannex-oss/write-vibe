import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// Register Service Worker with update detection (production only)
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In dev, unregister any stale SW and clear caches so Vite HMR/chunks aren't served stale
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
    if (window.caches) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
    }
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Poll for updates every 5 minutes
          setInterval(() => {
            try { reg.update().catch(() => {}); } catch (_) {}
          }, 5 * 60_000);

          const trackInstall = (worker) => {
            if (!worker) return;
            worker.addEventListener('statechange', () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent('swUpdateAvailable'));
              }
            });
          };

          if (reg.installing) trackInstall(reg.installing);
          reg.addEventListener('updatefound', () => trackInstall(reg.installing));

          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        })
        .catch((err) => console.warn('[SW] Registration failed:', err));
    });
  }
}