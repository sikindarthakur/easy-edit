export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Register service worker in production and preview
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          if (import.meta.env.DEV) {
            console.log('EasyEdit Service Worker registered:', reg.scope);
          }
        })
        .catch((err) => {
          if (import.meta.env.DEV) {
            console.warn('EasyEdit Service Worker registration failed:', err);
          }
        });
    });
  }
}

