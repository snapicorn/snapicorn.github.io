// Honor existing Reduce motion choices. CSS follows the device preference for everyone else.
try {
  if (window.localStorage.getItem('snapicorn-motion-preference') === 'reduce') {
    document.documentElement.setAttribute('data-motion', 'reduce');
  }
} catch {
  // If storage is unavailable, the device preference still applies.
}
