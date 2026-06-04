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
        // Poll for updates — guard against InvalidStateError when newestWorker is null
        setInterval(() => {
          try { reg.update(); } catch (_) {}
        }, 60_000);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent('swUpdateAvailable'));
            }
          });
        });
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));
  });
}