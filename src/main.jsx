import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// Register Service Worker with update detection
if ('serviceWorker' in navigator) {
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

        // Track any worker already installing when we register
        if (reg.installing) trackInstall(reg.installing);

        reg.addEventListener('updatefound', () => trackInstall(reg.installing));

        // When controller changes (new SW took over), reload to get fresh assets
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));
  });
}